import nodemailer from 'nodemailer';
import fs from 'fs';
import csvParser from 'csv-parser';

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send bulk emails from CSV
export const sendBulkEmails = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ 
        message: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file' 
      });
    }

    const filePath = req.file.path;
    const students = [];

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        students.push({
          id: row.id,
          name: row.name,
          email: row.email,
          password: row.password,
        });
      })
      .on('end', async () => {
        try {
          const transporter = createTransporter();
          const results = {
            success: [],
            failed: [],
          };

          // Send email to each student
          for (const student of students) {
            try {
              const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.email,
                subject: 'Your ProGrade Account Credentials',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Welcome to ProGrade!</h2>
                    
                    <p style="color: #555; font-size: 16px;">Dear <strong>${student.name}</strong>,</p>
                    
                    <p style="color: #555; font-size: 14px;">Your account has been successfully created. Below are your login credentials:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p style="margin: 5px 0;"><strong>Student ID:</strong> ${student.id}</p>
                      <p style="margin: 5px 0;"><strong>Email:</strong> ${student.email}</p>
                      <p style="margin: 5px 0;"><strong>Password:</strong> ${student.password}</p>
                    </div>
                    
                    <p style="color: #555; font-size: 14px;">Please login to the ProGrade portal and change your password immediately for security purposes.</p>
                    
                    <p style="color: #555; font-size: 14px; margin-top: 20px;">If you have any questions or need assistance, please contact your administrator.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center;">This is an automated email. Please do not reply to this message.</p>
                  </div>
                `,
              };

              await transporter.sendMail(mailOptions);
              results.success.push({
                email: student.email,
                name: student.name,
              });
              console.log(`✓ Email sent to ${student.email}`);
            } catch (error) {
              results.failed.push({
                email: student.email,
                name: student.name,
                error: error.message,
              });
              console.error(`✗ Failed to send email to ${student.email}:`, error.message);
            }
          }

          // Delete the uploaded CSV file after processing
          fs.unlinkSync(filePath);

          res.status(200).json({
            message: 'Bulk email process completed',
            total: students.length,
            successful: results.success.length,
            failed: results.failed.length,
            results,
          });
        } catch (error) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          console.error('Error sending emails:', error);
          res.status(500).json({ 
            message: 'Error sending emails', 
            error: error.message 
          });
        }
      })
      .on('error', (error) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        console.error('Error parsing CSV:', error);
        res.status(500).json({ 
          message: 'Error parsing CSV file', 
          error: error.message 
        });
      });
  } catch (error) {
    console.error('Error in sendBulkEmails:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ 
        message: 'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file' 
      });
    }

    const transporter = createTransporter();
    await transporter.verify();
    
    res.status(200).json({ 
      message: 'Email configuration is valid',
      emailUser: process.env.EMAIL_USER 
    });
  } catch (error) {
    console.error('Email configuration test failed:', error);
    res.status(500).json({ 
      message: 'Email configuration test failed', 
      error: error.message 
    });
  }
};

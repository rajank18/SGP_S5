import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const Login = () => {
  return (
    <div className='bg-black min-h-screen flex items-center justify-center px-4'>
      <Card className="w-full max-w-md text-white bg-gray-900 p-8 rounded-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400">
            Login to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-gray-800 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-gray-800 text-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">Remember me</Label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-400 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full py-6 text-lg">
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center mt-4 gap-2">
          <span className="text-gray-400 text-sm">Don't have an account?</span>
          <Button variant="link" className="text-blue-400 text-sm">Sign Up</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login

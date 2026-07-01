"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, RegisterInput } from "@/lib/validations"
import Link from "next/link"
import { useRouter } from "next/navigation" // 🚀 ADDED THIS IMPORT

export default function RegisterPage() {
  const router = useRouter() // 🚀 INITIALIZED ROUTER
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "VOLUNTEER",
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setError(null)
    try {
      // 1. Create the account
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      // Safety check: if response is not JSON, it's a 404 or 500 HTML page
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The server sent back a webpage instead of data. Check your API folder path.")
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Registration failed")
      }

      // 2. 🚀 AUTO-LOGIN: Log them in immediately so they don't have to type it again!
      const loginRes = await fetch("/api/login-handler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
      
      const loginData = await loginRes.json()

      if (loginRes.ok) {
        // Save to browser memory
        localStorage.setItem("user", JSON.stringify(loginData.user))
        
        // 3. 🚀 TELEPORT TO PROFILE: Force them to fill out their Name, Phone, Bio, etc.
        alert("Account created successfully! Let's complete your profile.")
        if (data.role === "VOLUNTEER") {
          router.push("/dashboard/volunteer/profile")
        } else {
          router.push("/dashboard/ngo/profile")
        }
      } else {
        // Fallback just in case auto-login fails
        router.push("/login")
      }

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join Samarpan as a Volunteer or NGO</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name / NGO Name</label>
              <input
                {...register("name")}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="John Doe or Help India NGO"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                {...register("password")}
                type="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">I am joining as:</label>
              <select
                {...register("role")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm bg-white"
              >
                <option value="VOLUNTEER">Volunteer</option>
                <option value="NGO">Organization (NGO)</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 transition-colors duration-200"
          >
            {isSubmitting ? "Creating & Signing in..." : "Register"}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
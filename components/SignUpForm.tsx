import React from 'react';

const SignUp: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full bg-white rounded-md p-8 shadow-sm">
        <h2 className="text-3xl font-bold mb-8">Sign Up</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="#" className="font-semibold text-black hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </section>
  );
};

export default SignUp;
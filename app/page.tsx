export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Macro Log
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Track your meals and macros with AI-powered parsing
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </a>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition dark:bg-gray-800 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-gray-700"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

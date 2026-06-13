import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-black transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-black dark:bg-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="font-semibold text-black dark:text-white">Where Is My Exam</span>
          </div>

          <div className="flex items-center gap-6">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} All rights reserved.
            </p>
            <Link
              to="/admin/login"
              className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

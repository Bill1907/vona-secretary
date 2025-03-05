import { Link } from "@remix-run/react";
import { useLanguage } from "~/context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { Mic } from "lucide-react";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="border-b shadow-sm py-4 bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
      <div className="container max-w-4xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <Link
            to="/"
            className="text-xl font-semibold text-gray-800 dark:text-white"
          >
            {t.appName}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* <nav>
            <ul className="flex gap-4">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.home}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.memoList}
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.settings}
                </Link>
              </li>
            </ul>
          </nav> */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

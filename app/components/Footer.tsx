import React from "react";
import { useLanguage } from "~/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t py-6 mt-10 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
              {t.appName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.serviceDescription}
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                {t.contactUs}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t.contactQuestion}
              </p>
              <a
                href="mailto:boseong.romi@gmail.com"
                className="text-sm text-indigo-600 dark:text-indigo-500 hover:underline"
              >
                boseong.romi@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} {t.copyright}
        </div>
      </div>
    </footer>
  );
}

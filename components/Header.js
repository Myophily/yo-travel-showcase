import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signOut } from "../utils/supabase";
import SearchBar from "./SearchBar";

const Header = ({ user }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  // Don't show search bar on login page
  const showSearchBar = router.pathname !== "/login";

  return (
    <header className="py-3 px-8">
      <div className="flex items-center justify-between mb-2">
        <Link href="/" className="text-xl font-semibold text-darkslategray">
          Yo! Travel
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              로그인
            </button>
          )}
          <img
            className="h-6 w-6 relative object-cover min-h-[24px]"
            loading="lazy"
            alt=""
            src="/icon--android--24--notificationoutlinenone@2x.png"
          />
        </div>
      </div>

      {showSearchBar && (
        <div className="mt-2">
          <SearchBar />
        </div>
      )}
    </header>
  );
};

export default Header;

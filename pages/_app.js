import { Fragment, useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/global.css";
import "../styles/quill-custom.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase, getCurrentUser } from "../utils/supabase";

function WebsiteInfo() {
  return (
    <div className="bg-gray-100 text-center py-4">
      <p className="text-sm text-gray-600">
        © 2024 Yo! Travel. All rights reserved.
      </p>
      <p className="text-sm text-gray-600">
        <Link href="/privacy-policy" className="hover:text-orangered transition-colors">
          Privacy Policy
        </Link>{" "}
        |{" "}
        <Link href="/terms-of-service" className="hover:text-orangered transition-colors">
          Terms of Service
        </Link>
      </p>
    </div>
  );
}



function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === "SIGNED_IN" && router.pathname === "/login") {
          router.push("/");
        }
        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    );

    return () => {
      if (authListener && typeof authListener.unsubscribe === "function") {
        authListener.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white w-full h-screen z-50">
        <div className="max-w-[768px] w-full h-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <Head>
        <title>Yo! Travel</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <div className="flex flex-col min-h-screen mx-auto relative">
        <div className="w-full max-w-[768px] mx-auto bg-white relative">
          <Header user={user} />
          <main className="flex-grow w-full">
            <Component {...pageProps} user={user} />
          </main>
          <div className="w-full bg-gray-100">
            <WebsiteInfo />
          </div>
          <div className="h-16"></div> {/* Spacer for footer */}
        </div>
        <div className="w-full z-50 fixed bottom-0 left-0 right-0 bg-white">
          <div className="max-w-[768px] mx-auto relative">
            <Footer />
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default MyApp;

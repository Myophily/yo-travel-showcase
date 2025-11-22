import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "./supabase";

export default function withAuth(WrappedComponent) {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!session) {
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

    return <WrappedComponent {...props} />;
  };
}

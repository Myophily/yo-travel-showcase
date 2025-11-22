import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithGoogle, signInWithKakao } from "../utils/supabase";
import Image from "next/image";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (provider) => {
    try {
      setLoading(true);
      let { data, error } = await (() => {
        switch (provider) {
          case "google":
            return signInWithGoogle();
          case "kakao":
            return signInWithKakao();
          default:
            throw new Error("Invalid provider");
        }
      })();

      if (error) throw error;
    } catch (error) {
      console.error("Error signing in:", error);
      alert(`Error signing in: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-darkslategray mb-4">
            Yo! Travel에 오신 것을 환영합니다.
          </h1>
          <p className="text-gray-600">로그인하기</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSignIn("google")}
            disabled={loading}
            className="flex items-center justify-center w-full bg-white border-2 border-gray-200 text-gray-800 h-14 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 relative"
          >
            <div className="absolute left-6">
              <Image
                src="/google-icon.svg"
                alt="Google"
                width={20}
                height={20}
              />
            </div>
            구글로 시작하기
          </button>

          <button
            onClick={() => handleSignIn("kakao")}
            disabled={loading}
            className="flex items-center justify-center w-full bg-[#FEE500] text-[#000000] h-14 px-6 rounded-lg font-semibold hover:bg-[#FDD800] transition-colors duration-200 relative"
          >
            <div className="absolute left-6">
              <Image src="/kakao-icon.svg" alt="Kakao" width={20} height={20} />
            </div>
            카카오로 시작하기
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-gray-600">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-gray-300 border-t-orangered rounded-full mr-2"></div>
            로그인 중...
          </div>
        )}
      </div>
    </div>
  );
}

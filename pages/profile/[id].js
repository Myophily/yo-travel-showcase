import { useState, useEffect } from "react";
import { supabase, getUserPosts } from "../../utils/supabase";
import Image from "next/image";
import Link from "next/link";
import RelationshipUserCard from "../../components/RelationshipUserCard";
import { useRouter } from "next/router";
import PostItem from "../../components/PostItem";
import LoadingSpinner from "../../components/LoadingSpinner";

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchProfile();
      loadUserPosts();
    }
  }, [id, page]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          router.push("/404");
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/404");
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async () => {
    if (!id) return;

    setPostsLoading(true);
    const { data, count } = await getUserPosts(id, page);

    if (data) {
      setPosts((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 10); // Assuming pageSize is 10
    }
    setPostsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
            {profile.name}'s 페이지
          </h1>
        </div>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <div className="self-stretch bg-white rounded-lg">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                <Image
                  src={profile.profile_picture_url || "/default-avatar.png"}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-darkslategray">
                {profile.name}
              </h2>
            </div>
            <div className="mb-4">
              <label className="font-semibold text-darkslategray">소개:</label>
              <p className="text-darkslategray">
                {profile.bio || "No bio available"}
              </p>
            </div>
            {profile.relationship_user_id && (
              <RelationshipUserCard userId={profile.relationship_user_id} />
            )}
          </div>
        </div>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full text-left text-5xs text-darkslategray font-open-sans">
        <div className="self-stretch flex flex-col items-center justify-center w-full">
          <div className="w-full pb-4">
            {posts.map((post) => (
              <Link
                key={post.post_id}
                href={`/post/${post.post_id}`}
                className="block no-underline text-inherit w-full"
              >
                <PostItem course={post} />
              </Link>
            ))}
          </div>

          {postsLoading && (
            <div className="flex justify-center items-center h-[50vh]">
              <LoadingSpinner />
            </div>
          )}

          {!postsLoading && posts.length === 0 && (
            <div className="text-center py-8 text-gray-500 w-full">
              <p>게시물이 없습니다.</p>
            </div>
          )}

          {hasMore && !postsLoading && posts.length > 0 && (
            <div className="items-center justify-center text-center py-4">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={postsLoading}
                className="bg-mistyrose text-orangered px-6 py-2 rounded-full hover:bg-orangered hover:text-white transition-colors disabled:opacity-50"
              >
                {postsLoading ? "로딩 중..." : "더보기"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;

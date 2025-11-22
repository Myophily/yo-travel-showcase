import { useState, useEffect } from "react";
import { supabase, getCurrentUser, getUserPosts } from "../../utils/supabase";
import Image from "next/image";
import Link from "next/link";
import RelationshipUserCard from "../../components/RelationshipUserCard";
import { useRouter } from "next/router";
import PostItem from "../../components/PostItem";
import LoadingSpinner from "../../components/LoadingSpinner";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    bio: "",
    relationship_user_id: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        fetchProfile(currentUser);
        loadUserPosts(currentUser.id);
      }
    };

    checkUser();
  }, [router]);

  const loadUserPosts = async (userId) => {
    if (!userId) return;

    setPostsLoading(true);
    const { data, count } = await getUserPosts(userId, page);

    if (data) {
      setPosts((prev) => (page === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === 10); // Assuming pageSize is 10
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadUserPosts(user.id);
    }
  }, [user, page]);

  const fetchProfile = async (currentUser) => {
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        if (error.code === "PGRST116") {
          setIsEditing(true);
        }
      } else if (data) {
        setProfile(data);
        setEditedProfile({
          name: data.name || "",
          bio: data.bio || "",
          relationship_user_id: data.relationship_user_id || "", // Add this line
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const profilePictureUrl = file ? await uploadFile() : null;

      const updates = {
        user_id: user.id,
        name: editedProfile.name,
        bio: editedProfile.bio,
        relationship_user_id: editedProfile.relationship_user_id || null,
        ...(profilePictureUrl && { profile_picture_url: profilePictureUrl }),
        updated_at: new Date(),
      };

      const { error } = await supabase.from("user_profile").upsert(updates, {
        returning: "minimal",
      });

      if (error) throw error;

      setIsEditing(false);
      fetchProfile(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start leading-[normal] tracking-[normal]">
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-5 box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-2.5 max-w-full">
          <h1 className="m-0 relative text-xl leading-[26px] font-semibold font-open-sans text-darkslategray">
            내 페이지
          </h1>
        </div>
      </section>
      <section className="self-stretch flex flex-row items-start justify-start pt-0 px-8 pb-[26px] box-border max-w-full">
        <div className="flex-1 flex flex-col items-start justify-start gap-5 max-w-full">
          <div className="self-stretch bg-white rounded-lg">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={
                        profile?.profile_picture_url || "/default-avatar.png"
                      }
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-darkslategray">
                    이름:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orangered"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-darkslategray">
                    소개:
                  </label>
                  <textarea
                    name="bio"
                    value={editedProfile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orangered"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="font-semibold text-darkslategray">
                    커플 ID
                  </label>
                  <input
                    type="text"
                    name="relationship_user_id"
                    value={editedProfile.relationship_user_id}
                    onChange={handleInputChange}
                    placeholder="Related Profile ID (optional)"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orangered"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orangered text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? "Saving..." : "Save Profile"}
                </button>
              </form>
            ) : (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={
                        profile?.profile_picture_url || "/default-avatar.png"
                      }
                      alt="Profile Picture"
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-darkslategray">
                    {profile?.name}
                  </h2>
                </div>
                <div className="mb-4">
                  <label className="font-semibold text-darkslategray">
                    소개:
                  </label>
                  <p className="text-darkslategray">
                    {profile?.bio || "No bio available"}
                  </p>
                </div>
                {profile?.relationship_user_id && (
                  <RelationshipUserCard userId={profile.relationship_user_id} />
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 bg-orangered text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  수정
                </button>
              </>
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
              <Link
                href="/write"
                className="mt-4 inline-block bg-orangered text-white px-6 py-2 rounded-full hover:bg-red-600 transition-colors"
              >
                첫 글 게시하기
              </Link>
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

export default ProfilePage;

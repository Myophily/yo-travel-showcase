import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import Image from "next/image";

const RelationshipUserCard = ({ userId }) => {
  const [relationshipUser, setRelationshipUser] = useState(null);

  useEffect(() => {
    const fetchRelationshipUser = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profile")
          .select("name, profile_picture_url")
          .eq("user_id", userId)
          .single();

        if (error) throw error;
        setRelationshipUser(data);
      } catch (error) {
        console.error("Error fetching relationship user:", error);
      }
    };

    fetchRelationshipUser();
  }, [userId]);

  if (!relationshipUser) return null;

  return (
    <div className="mt-6 bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Relationship</h3>
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <Image
            src={relationshipUser.profile_picture_url || "/default-avatar.png"}
            alt="Relationship User"
            width={64}
            height={64}
            sizes="64px"
            className="object-cover"
          />
        </div>
        <p className="font-medium">{relationshipUser.name}</p>
      </div>
    </div>
  );
};

export default RelationshipUserCard;

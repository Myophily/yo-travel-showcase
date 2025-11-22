export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const restApiKey = process.env.KAKAO_REST_API_KEY;

  if (!restApiKey) {
    console.error("KAKAO_REST_API_KEY is not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const { origin, destination, waypoints, priority, avoid } = req.body;

    // Validate required fields
    if (!origin || !destination) {
      return res.status(400).json({ error: "Missing required fields: origin and destination" });
    }

    const requestBody = {
      origin,
      destination,
      waypoints: waypoints || [],
      priority: priority || "DISTANCE",
      avoid: avoid || ["ferries", "uturn"],
    };

    const response = await fetch(
      "https://apis-navi.kakaomobility.com/v1/waypoints/directions",
      {
        method: "POST",
        headers: {
          Authorization: `KakaoAK ${restApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kakao API error:", response.status, errorText);
      return res.status(response.status).json({
        error: "Failed to fetch directions from Kakao API",
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Error in directions API:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}

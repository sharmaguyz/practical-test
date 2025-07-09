export async function fetchData(url, token = "",idToken = "",accessToken="") {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
  
      if (token != '') headers["Authorization"] = `Bearer ${token}`;
      if(idToken != '') headers['X-ID-TOKEN'] = idToken;
      if(accessToken != '') headers['X-ACCESS-TOKEN'] = accessToken;
      const res = await fetch(url, {
        headers,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Something went wrong");
      }
  
      const data = await res.json();
      return { data, error: null };
    } catch (error) {
      console.error(`API Error [${url}]:`, error.message);
      return { data: null, error: error.message };
    }
}

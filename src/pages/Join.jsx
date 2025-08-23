import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from 'react'

function Join() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const joinToken = searchParams.get("token");

  const joinMutation = useMutation({
    mutationFn: async (token) => {
      const { data } = await api.post("/bills/join", { token });
      return data;
    },
    onSuccess: (data) => {
      if (data?.sessionId) {
        navigate(`/bill/${data.sessionId}`);
      }
    },
    onError: (err) => {
      console.error("Join failed:", err);
    },
  });

  useEffect(() => {
    if (!joinToken) return;

    if (!user) {
      // store redirect and go to login
      sessionStorage.setItem("redirectAfterLogin", `/join?token=${joinToken}`);
      navigate("/login");
    } else {
      // trigger mutation once user is available
      joinMutation.mutate(joinToken);
    }
  }, [user, joinToken, navigate]);

  if(joinMutation.isError){
    return <div style={{ color: "red" }}>Invitation has expired or is invalid...</div>;
  }

  return <div>Redirecting...</div>;
}

export default Join;

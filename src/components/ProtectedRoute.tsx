import { useEffect,useState } from "react";
import { supabase } from "../lib/supabase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}:any){

  const [user,setUser] = useState<any>(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    supabase.auth.getUser().then(({data})=>{
      setUser(data.user);
      setLoading(false);
    });

  },[]);

  if(loading) return <div>Loading...</div>;

  if(!user) return <Navigate to="/login"/>

  return children;

}
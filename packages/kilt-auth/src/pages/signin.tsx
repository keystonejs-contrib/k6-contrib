import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import getProvider from "../lib/getProvider";

export const getSigninPage = () => () => <SignIn />;

function SignIn() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      await getProvider();
    })();
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("/challenge");
    console.log(data);
    const output = await window.kilt.sporran.signWithDid(data);

    const res = await axios.post("/verify", output, { withCredentials: true });
    console.log(res);
    if (res.status === 200) {
      router.push("/");
    } else {
      console.log("error");
    }
  };

  return (
    <>
      <h1>Please sign in</h1>
      <a onClick={handleClick}>Login</a>
    </>
  );
}

"use client";

import { useState } from "react";

export default function Test() {
  const [counter, setCounter] = useState<number>(0);

  return (
    <>
      <p>{counter}</p>
      <button
        onClick={() => {
          setCounter(counter + 1);
        }}
      >
        Increment!
      </button>
    </>
  );
}

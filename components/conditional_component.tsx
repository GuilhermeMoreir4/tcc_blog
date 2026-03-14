"use client";

import { useState } from "react";
import { Button } from "./ui/button";

type IfProps = {
  condition: boolean;
  children: React.ReactElement;
};

export default function If({ condition, children }: IfProps) {
  const [canShow, setCanShow] = useState<Boolean>(!condition);

  return (
    <>
      <div>
        <div>{condition}</div>
        <Button
          onClick={() => {
            setCanShow(true);
          }}
        >
          Sim
        </Button>
        <Button
          onClick={() => {
            setCanShow(false);
          }}
        >
          Não
        </Button>
      </div>
      {canShow == condition ? children : null}
    </>
  );
}

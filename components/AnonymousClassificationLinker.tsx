"use client";

import { useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { linkAnonymousClassifications } from "../libs/link-anonymous-classifications";
import { getAnonymousToken } from "../libs/anonymous-token";

export const AnonymousClassificationLinker = (): null => {
  const { user } = useUser();
  const hasLinkedRef = useRef(false);

  useEffect(() => {
    if (user && !hasLinkedRef.current && getAnonymousToken()) {
      hasLinkedRef.current = true;
      linkAnonymousClassifications();
    }
  }, [user]);

  return null;
};

"use client";

import NextLink from "next/link";
import { ComponentProps, forwardRef } from "react";

type OptimizedLinkProps = ComponentProps<typeof NextLink>;

/**
 * Optimized link component that properly handles resource preloading
 * Addresses the warning: "The resource was preloaded using link preload but not used within a few seconds"
 */
export const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  function OptimizedLink({ prefetch = false, ...props }, ref) {
    // Use prefetch false by default to avoid unnecessary preloading
    // This addresses the console warning about unused preloaded resources
    return <NextLink ref={ref} prefetch={prefetch} {...props} />;
  }
); 
type BloopRouter = {
  push: (href: any) => void;
};

export function openBloopWithContext(router: BloopRouter, prompt: string, source: string) {
  router.push({
    pathname: "/bloop-chat",
    params: {
      autoSend: "true",
      prompt,
      source,
    },
  });
}

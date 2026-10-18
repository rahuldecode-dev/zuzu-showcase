// Where the "Get the code" button points. On Vercel this resolves to the repo
// the site was deployed from, so a fork links to itself with no setup.
const owner = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER;
const slug = process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG;

export const REPO_URL =
  owner && slug
    ? `https://github.com/${owner}/${slug}`
    : "https://github.com/rahuldecode-dev/zuzu-showcase";

// IMPORATANT NOTE: update this file in two or more repos as well

export const deconstructExternalEmail = ({
  email,
}: {
  email: string;
}): {
  alias: string;
  domain: string;
} => {
  const [alias, domain] = email.split("@");
  return { alias, domain };
};

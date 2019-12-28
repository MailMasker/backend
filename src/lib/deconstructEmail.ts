export const deconstructEmail = ({
  email
}: {
  email: string;
}): {
  base: string;
  domain: string;
} => {
  const [base, domain] = email.split("@");
  return { base, domain };
};

const regExp = new RegExp(/^(\d+)(s|m|h|d)+$/, "igu");

// Need to update all places that use this because the return values changed

export const deconstructMailMask = ({
  email,
}: {
  email: string;
}): {
  alias: string;
  domain: string;
  mailMaskParts: string[];
  expiryToken?: string;
} => {
  const [alias, domain] = email.split("@");

  if (!alias) {
    throw new Error("alias missing");
  }
  if (!domain) {
    throw new Error("domain missing");
  }

  let expiryTokens: string[] = [];
  let mailMaskParts: string[] = [];
  for (const part of alias.split(".")) {
    if (part.match(regExp)) {
      expiryTokens.push(part);
    } else {
      mailMaskParts.push(part);
    }
  }

  return {
    alias: alias.toLowerCase(),
    mailMaskParts,
    domain: domain.toLowerCase(),
    expiryToken:
      expiryTokens.length > 0
        ? expiryTokens[expiryTokens.length - 1]
        : undefined,
  };
};

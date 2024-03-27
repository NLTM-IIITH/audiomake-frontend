import React from "react";
import {
  Box,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

const Navbar = () => {
  const linkColor = useColorModeValue("white");
  const linkHoverColor = useColorModeValue("blue.200", "white");
  const navbarBgColor = useColorModeValue("black");

  const NAV_ITEMS = [
    {
      label: "Home",
      href: "#",
    },
    {
      label: "GitHub",
      href: "#",
    },
    {
      label: "Privacy Policy",
      href: "#",
    },
  ];

  return (
    <Stack bg={navbarBgColor} className="flex justify-between" direction="row" spacing={4}>

        <Box
          as="a"
          p={4}
          href="#"
          fontSize="xl"
          fontWeight={500}
          color={linkColor}
          _hover={{
            textDecoration: "none",
            color: linkHoverColor,
          }}
        >
          Accurate OCR
        </Box>

          <div>
      {NAV_ITEMS.map((navItem) => (
          <Box
            as="a"
            key={navItem.label}
            p={2}
            href={navItem.href ?? "#"}
            fontSize="sm"
            fontWeight={500}
            color={linkColor}
            _hover={{
              textDecoration: "none",
              color: linkHoverColor,
            }}
          >
            {navItem.label}
          </Box>
      ))}
      </div>
    </Stack>
  );
};

export default Navbar;

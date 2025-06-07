import React from "react";
import { Flex, FlexProps } from "@chakra-ui/react";

interface Props extends FlexProps { }
export const Col = (props: Props) => <Flex direction="column" {...props} />;

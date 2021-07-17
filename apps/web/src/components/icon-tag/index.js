import { Flex, Text } from "rebass";

function IconTag({ text, title, icon: Icon, onClick, styles, testId }) {
  return (
    <Flex
      data-test-id={testId}
      flexShrink={0}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      title={title}
      sx={{
        borderRadius: "default",
        border: "1px solid",
        borderColor: "border",
        ":hover": {
          bg: "hover",
          filter: "brightness(95%)",
        },
        px: 1,
        mr: 1,
        cursor: onClick ? "pointer" : "default",
        ...styles?.container,
      }}
      bg="bgSecondary"
      justifyContent="center"
      alignItems="center"
      py="2px"
    >
      <Icon size={11} color={styles?.icon?.color} sx={{ ...styles?.icon }} />
      <Text variant="body" p={0} fontSize={11} ml={"2px"}>
        {text}
      </Text>
    </Flex>
  );
}
export default IconTag;

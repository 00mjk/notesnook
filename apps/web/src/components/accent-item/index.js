import React from "react";
import { Flex } from "rebass";
import * as Icon from "../icons";
import { useStore as useThemeStore } from "../../stores/theme-store";
import { isUserPremium } from "../../common";
import { showBuyDialog } from "../../common/dialog-controller";

function AccentItem(props) {
  const { code, label } = props;
  const setAccent = useThemeStore((store) => store.setAccent);
  const accent = useThemeStore((store) => store.accent);

  return (
    <Flex
      variant="rowCenter"
      sx={{ position: "relative" }}
      onClick={async () => {
        if (isUserPremium()) setAccent(code);
        else {
          await showBuyDialog();
        }
      }}
      key={label}
    >
      {code === accent && (
        <Icon.Checkmark
          sx={{
            position: "absolute",
            zIndex: 1,
            cursor: "pointer",
          }}
          color="static"
          size={20}
        />
      )}
      <Icon.Circle size={40} sx={{ cursor: "pointer" }} color={code} />
    </Flex>
  );
}
export default AccentItem;

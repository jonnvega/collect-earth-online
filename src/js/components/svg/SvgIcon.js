import React from "react";
import {cancelIcon} from "./cancelIcon";
import {checkIcon} from "./checkIcon";
import {closeIcon} from "./closeIcon";
import {downCaretIcon} from "./downCaretIcon";
import {downRightArrowIcon} from "./downRightArrowIcon";
import {drawIcon} from "./drawIcon";
import {editIcon} from "./editIcon";
import {helpIcon} from "./helpIcon";
import {infoIcon} from "./infoIcon";
import {leftArrowIcon} from "./leftArrowIcon";
import {leftDoubleIcon} from "./leftDoubleIcon";
import {lineStringIcon} from "./lineStringIcon";
import {minus} from "./minus";
import {plus} from "./plus";
import {pointIcon} from "./pointIcon";
import {polygonIcon} from "./polygonIcon";
import {questionIcon} from "./questionIcon";
import {rightArrowIcon} from "./rightArrowIcon";
import {rightCaretIcon} from "./rightCaretIcon";
import {rightDoubleIcon} from "./rightDoubleIcon";
import {ruleIcon} from "./ruleIcon";
import {saveIcon} from "./saveIcon";
import {trashIcon} from "./trashIcon";
import {upArrowIcon} from "./upArrowIcon";
import {upCaretIcon} from "./upCaretIcon";
import {zoomInIcon} from "./zoomInIcon";

const iconMap = {
    "cancel": cancelIcon,
    "check": checkIcon,
    "close": closeIcon,
    "downCaret": downCaretIcon,
    "downRightArrow": downRightArrowIcon,
    "draw": drawIcon,
    "edit": editIcon,
    "help": helpIcon,
    "info": infoIcon,
    "leftArrow": leftArrowIcon,
    "leftDouble": leftDoubleIcon,
    "lineString": lineStringIcon,
    "minus": minus,
    "plus": plus,
    "point": pointIcon,
    "polygon": polygonIcon,
    "question": questionIcon,
    "rightArrow": rightArrowIcon,
    "rightCaret": rightCaretIcon,
    "rightDouble": rightDoubleIcon,
    "rule": ruleIcon,
    "save": saveIcon,
    "trash": trashIcon,
    "upArrow": upArrowIcon,
    "upCaret": upCaretIcon,
    "zoomIn": zoomInIcon
};

export default function SvgIcon({icon, color, size}) {
    return (
        <div
            style={{
                color: color || "black",
                fill: color || "black",
                height: size,
                maxHeight: size,
                maxWidth: size,
                width: size
            }}
        >
            {iconMap[icon]}
        </div>
    );
}

export function ButtonSvgIcon({icon, size}) {
    return (
        <div
            className="svg-icon"
            style={{
                fill: "currentColor",
                height: size,
                maxHeight: size,
                maxWidth: size,
                cursor: "pointer",
                width: size
            }}
        >
            {iconMap[icon]}
        </div>
    );
}

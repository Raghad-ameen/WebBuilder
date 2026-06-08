import TextElement from "./TextElement";
import ImageElement from "./ImageElement";
import ShapeElement from "./ShapeElement";
import ButtonElement from "./ButtonElement";
import LinkElement from "./LinkElement";
import InputElement from "./InputElement";

export default function ElementRenderer(props) {
  const { item } = props;

  switch (item.type) {
    case "text":
      return <TextElement {...props} />;

    case "image":
      return <ImageElement {...props} />;

    case "shape":
      return <ShapeElement {...props} />;

    case "button":
      return <ButtonElement {...props} />;

    case "link":
      return <LinkElement {...props} />;

    case "input":
      return <InputElement {...props} />;

    default:
      return null;
  }
}
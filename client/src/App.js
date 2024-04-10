import React, { Component, useState } from "react";
import axios from "axios";

// UI Imports
import { Select } from "antd";
import { Card as Cardx, CardHeader, CardBody, CardFooter, Image, Stack, Heading, Text, Divider, ButtonGroup, Box, Input as Inputx, InputGroup, InputLeftAddon, Grid, Textarea, Flex, Badge, Tooltip, Button } from "@chakra-ui/react";
import { RiFileCopyFill } from "react-icons/ri";
import { RxReload } from "react-icons/rx";
import { MdDeleteForever } from "react-icons/md";
import { ImParagraphJustify } from "react-icons/im";
import { LuHeading } from "react-icons/lu";
import { CiViewTable } from "react-icons/ci";
import { CiImageOn } from "react-icons/ci";
import { TbMathFunction } from "react-icons/tb";

// CSS Import
import "./App.css";

// Componennts Import
import Cropper from "./multi-cropper/cropper";
import * as $ from "./multi-cropper/src/js/utilities";
import Navbar from "./components/Navbar";
import Controls from "./components/Controls";

// App Component
class App extends Component {
  // Constructors and states
  constructor(props) {
    super(props);
    // In ES6 must bind(this) to use this reference in function
    // You can use arrow function to skip bind
    this.renderCropBox = this.renderCropBox.bind(this);
    this.newCropBox = this.newCropBox.bind(this);
    this.destroyCropBox = this.destroyCropBox.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleOCRTextChange = this.handleOCRTextChange.bind(this);
    this.handleSaveAndRun = this.handleSaveAndRun.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    // this.handleMouseDown = this.handleMouseDown.bind(this);
    this.state = {
      imgSrc: null,
      cropBoxesData: [],
      imageUploaded: false,
      language: "english",
      modality: "printed",
      ocrVersion: "V-01.04.01.00",
      layoutVersion: "V-01.00.01",
      loading: false,
      server: "bhashini",
      selectedButton: "Paragraph",
      boundingBoxCollection: [],
      newCropBoxData: null,
    };
  }

  handleButtonClick = (buttonName) => {
    this.setState(prevState => ({
      selectedButton: prevState.selectedButton === buttonName ? "Paragraph" : buttonName
    }));
  };

  /**
   * @handleImageUpload
  * */
  handleImageUpload(event) {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        imgSrc: reader.result,
      });
    };
    reader.readAsDataURL(file);
    this.setState({ imageUploaded: true });
  }

  /**
   * @newCropBox_is_Created
  * */

  newCropBox() {
    document.addEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseUp = (event) => {
    document.removeEventListener("mouseup", this.handleMouseUp);
    event.preventDefault();
    event.stopPropagation();

    const cropBoxData = this.cropper.getCropBoxDatas()[0];

    // const updatedCropBoxesData = cropBoxDatas.map((cropBoxData, index) => {
    //   const existingCropBoxData = this.state.cropBoxesData[index] || {};
    //   return {
    //     ...existingCropBoxData,
    //     ...cropBoxData,
    //   };
    // });

    this.setState({ loading: false, newCropBoxData: cropBoxData }, () => {
      this.sendCroppedImages({ language: "english", modality: "printed" });
    });

    // Update the state with the new crop box datas
    // this.setState(
    //   {
    //     cropBoxesData: updatedCropBoxesData,
    //     boundingBoxCollection: this.state.boundingBoxCollection,
    //   },
    //   () => {
    //     this.sendCroppedImages({ language: "english", modality: "printed" });
    //   }
    // );
  }

  // handleMouseUp() {
  //   document.removeEventListener("mouseup", this.handleMouseUp);
    // const cropBoxDatas = this.cropper.getCropBoxDatas();
    // console.log("these are the initial crop boxes");
    // console.log(cropBoxDatas);
    // this.setState({ loading: false });

    // const updatedCropBoxesData = cropBoxDatas.map((cropBoxData, index) => {
    //   const existingCropBoxData = this.state.cropBoxesData[index] || {};
    //   return {
    //     ...existingCropBoxData,
    //     ...cropBoxData,
    //   };
    // });

    // // Update the state with the new crop box datas
    // this.setState(
    //   {
    //     cropBoxesData: updatedCropBoxesData,
    //     boundingBoxCollection: this.state.boundingBoxCollection,
    //   },
    //   () => {
    //     this.sendCroppedImages({ language: "english", modality: "printed" });
    //   }
    // );
  // }

  // Cropbox events
  destroyCropBox() {
    this.forceUpdate();
  }

  moveEnd = (event) => {
    this.forceUpdate();
  };

  cropBuildOver = (event) => {
    // console.log(event);
  };

  getCroppedImage(cropBoxData) {
    return new Promise((resolve) => {
      this.cropper.setCropBoxData(cropBoxData);
      const canvas = this.cropper.getCroppedCanvas();
      canvas.toBlob((blob) => {
        const file = new File([blob], `crop.png`, {
          type: "image/png",
        });
        resolve(file);
      });
    });
  }

  /**
   * @get_all_the_crop_boxes
  * */
  getCroppedImages() {
    const croppedImages = [];
    const cropBoxDatas = this.cropper.getCropBoxDatas();
    console.log(cropBoxDatas);

    if (cropBoxDatas) {
      // Map each crop box data to a Promise that resolves with the cropped image
      const cropPromises = cropBoxDatas.map((cropBoxData, index) => {
        return new Promise((resolve) => {
          this.cropper.setCropBoxData(cropBoxData);
          const canvas = this.cropper.getCroppedCanvas();
          canvas.toBlob((blob) => {
            const currentDate = new Date();
            const time = currentDate.getTime();
            const file = new File([blob], `crop_${index}_${time}.png`, {
              type: "image/png",
            });
            resolve(file);
          });
        });
      });
      return Promise.all(cropPromises);
    }
    return Promise.resolve(croppedImages);
  }

  /**
   * @send_cropBoxes
  * */

   // there is something wrong here that's why there is inconsistency while sending the cropped images and getting same o/p
   async sendCroppedImages(options) {
    try {
      this.setState({ loading: true });
      const { newCropBoxData, cropBoxesData, language } = this.state;
  
      if (newCropBoxData) {
        const croppedImage = await this.getCroppedImage(newCropBoxData);
  
        if (croppedImage) {
          const formData = new FormData();
          formData.append("image", croppedImage);
          formData.append("language", language);
          formData.append("version", "v4_robust");
          formData.append("modality", "printed");
  
          const response = await axios.post(
            "http://localhost:5000/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
  
          const ocr = response.data.text;
          const updatedCropBoxData = { ...newCropBoxData, ocrText: ocr };
          const updatedCropBoxesData = [...cropBoxesData, updatedCropBoxData];
  
          this.setState({ cropBoxesData: updatedCropBoxesData, newCropBoxData: null, loading: false });
        }
      }
    } catch (error) {
      console.error("Error sendingCroppedImages" + error);
    }
  }

  cropImage() {
    this.cropper.crop();
    this.sendCroppedImages();
  }

  handleSaveAndRun() {
    this.sendCroppedImages();
  }

  render() {
    const { selectedButton } = this.state;

    // console.log(this.state.boundingBoxCollection); // to see the bounding boxes collection
    // console.log("current length is " + this.state.boundingBoxCollection.length); // to see the length of bounding boxes

    var boundingBoxes = Array.from(document.querySelectorAll('.cropper-face'));
    // console.log(boundingBoxes); // to see the bounding boxes

    if (boundingBoxes.length > 0) {
      boundingBoxes.forEach(elem => {
        let coord = elem.parentElement.querySelector('.cropper-point.point-n').getBoundingClientRect();
        // console.log(coord);
        let elemP = elem.getAttribute("data-cropperidentifier"); // unique property
        let cat = selectedButton; // current property
        let dict = { key: elemP, category: cat, coordinates: coord};

        // Check if dict with the same key already exists in boundingBoxCollection
        if (!this.state.boundingBoxCollection.some(item => item.key === elemP)) {
          this.setState(prevState => ({
            boundingBoxCollection: [...prevState.boundingBoxCollection, dict]
          }));
        }
      });
    }

    let collection = this.state.boundingBoxCollection;

    collection.forEach(item => {
      let key = document.querySelector(`.cropper-face[data-cropperidentifier='${item.key}']`)
      let cat = item.category;
      switch (cat) {
        case "Paragraph":
          key.style.backgroundColor = "#805AD5";
          break;
        case "Heading":
          key.style.backgroundColor = "#E53E3E";
          break;
        case "Table":
          key.style.backgroundColor = "#38A169";
          break;
        case "Image":
          key.style.backgroundColor = "#3182ce";
          break;
        case "Equation":
          key.style.backgroundColor = "#ECC94B";
          break;
      }
    })

    return (
      <div>
        <Navbar />

        <Controls
          onSendRequest={this.sendCroppedImages.bind(this)}
          onLanguageChange={this.handleLanguageChange}
          language={this.state.language}
          setLanguage={(value) => this.setState({ language: value })}
          modality={this.state.modality}
          setModality={(value) => this.setState({ modality: value })}
          onSaveAndRun={this.handleSaveAndRun}
          server={this.state.server}
          setServer={(value) => this.setState({ server: value })}
          onDownloadText={this.downloadTextFile.bind(this)}
        />

        <div>
          <div>
            {!this.state.imageUploaded && (
              <div className="p-10">
                <h1 className="font-semibold text-xl pb-10">
                  Upload an Image to get started
                </h1>
                <input
                  type="file"
                  accept="image/*"
                  onChange={this.handleImageUpload}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex py-6">
          {this.state.imgSrc && (
            <div className="p-4">
              <div className="flex flex-col gap-y-2">
                <Button colorScheme='purple' width='130px' variant={selectedButton === 'Paragraph' ? 'solid' : 'outline'} onClick={() => this.handleButtonClick('Paragraph')} >
                  <Box as={ImParagraphJustify} marginRight="2" />
                  Paragraph
                </Button>
                <Button colorScheme='red' width='130px' variant={selectedButton === 'Heading' ? 'solid' : 'outline'} onClick={() => this.handleButtonClick('Heading')} >
                  <Box as={LuHeading} marginRight="2" />
                  Heading
                </Button>
                <Button colorScheme='green' width='130px' variant={selectedButton === 'Table' ? 'solid' : 'outline'} onClick={() => this.handleButtonClick('Table')} >
                  <Box as={CiViewTable} marginRight="2" />
                  Table
                </Button>
                <Button colorScheme='blue' width='130px' variant={selectedButton === 'Image' ? 'solid' : 'outline'} onClick={() => this.handleButtonClick('Image')} >
                  <Box as={CiImageOn} marginRight="2" />
                  Image
                </Button>
                <Button colorScheme='yellow' width='130px' variant={selectedButton === 'Equation' ? 'solid' : 'outline'} onClick={() => this.handleButtonClick('Equation')} >
                  <Box as={TbMathFunction} marginRight="2" />
                  Equation
                </Button>
              </div>
            </div>
          )}

          <div>
            {this.state.imgSrc && (
              <div>
                {/* {<TransformWrapper initialScale={1}>
              <TransformComponent>} */}
                <Cropper
                  style={{ height: 420, width: 740 }}
                  autoCrop={false}
                  autoCropArea={0.3}
                  guides={true}
                  movable={false}
                  scalable={false}
                  rotatable={false}
                  zoomable={false}
                  cropend={this.moveEnd}
                  newcropbox={this.newCropBox}
                  destroycropbox={this.destroyCropBox}
                  renderCropBox={this.renderCropBox}
                  buildover={this.cropBuildOver}
                  params={{
                    types: ["woman", "dog", "cat"],
                  }}
                  src={this.state.imgSrc}
                  ref={(cropper) => {
                    this.cropper = cropper;
                  }}
                />
                {/* {</TransformComponent>
            </TransformWrapper>} */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
  * @handling_functions
  **/

  handleToDestroyCropBox = (event) => {
    const index = event.currentTarget.getAttribute("cropboxindex");
    if (index !== null) {
      const cropBoxIndex = parseInt(index, 10);
      const updatedCropBoxesData = this.state.cropBoxesData.filter((_, i) => i !== cropBoxIndex);
      const updatedBoundingBoxCollection = this.state.boundingBoxCollection.filter((_, i) => i !== cropBoxIndex);
  
      this.setState({
        cropBoxesData: updatedCropBoxesData,
        boundingBoxCollection: updatedBoundingBoxCollection,
      });
  
      this.cropper.destroyCropBoxByIndex(cropBoxIndex);
    }
  };

  handleOCRTextChange(index, event) {
    const { value } = event.target;
    const updatedCropBoxesData = [...this.state.cropBoxesData];
    updatedCropBoxesData[index] = {
      ...updatedCropBoxesData[index],
      ocrText: value,
    };
    this.setState({
      cropBoxesData: updatedCropBoxesData,
    });
  }

  handleLanguageChange = (value) => {
    this.setState({ language: value });
  };

  async handleReloadOCRText(index) {
    try {
      this.setState({ loading: true });
      const cropBoxesData = await this.getCroppedImages();
      const cropBoxData = cropBoxesData[index];
      console.log("current language on reload is " + this.state.language);

      const clearCropBoxesData = [...this.state.cropBoxesData];
      clearCropBoxesData[index] = {
        ...clearCropBoxesData[index],
        ocrText: '',
      };
      this.setState({ cropBoxesData: clearCropBoxesData });

      if (cropBoxData) {

        const formData = new FormData();
        formData.append("image", cropBoxData);
        formData.append("language", this.state.language);
        formData.append("version", "v4_robust");
        formData.append("modality", "printed");

        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedCropBoxesData = [...this.state.cropBoxesData];
        updatedCropBoxesData[index] = {
          ...updatedCropBoxesData[index],
          ocrText: response.data.text,
        };

        this.setState({ loading: false });

        this.setState({ cropBoxesData: updatedCropBoxesData });
      }
    } catch (error) {
      console.error("error reloading" + error);
      console.error("error reloading" + error.message);
    }
  }

  handleCopyOCRText(index) {
    const { cropBoxesData } = this.state;
    const ocrText = cropBoxesData[index] ? cropBoxesData[index].ocrText : "";

    const textarea = document.createElement("textarea");
    textarea.value = ocrText;
    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand("copy");

    document.body.removeChild(textarea);
  }

  handleToActiveCropBox = (event) => {
    let e = $.getEvent(event);
    let target = e.target;
    let index = null;

    if (target instanceof HTMLElement) {
      index = target.getAttribute("cardindex");

      if (target.type === "button") {
        console.log("active button");
        return;
      }

      while (index == null && target.parentNode) {
        target = target.parentNode;
        if (target instanceof HTMLElement) {
          index = target.getAttribute("cardindex");
        }
      }
    }
    if (this.cropper != null && index != null) {
      this.cropper.activeCropBoxByIndex(parseInt(index, 10));
    }
  };

  wordsLen(str) {
    const array = str.trim().split(/\s+/);
    return array.length;
  }

  downloadTextFile() {
    const { cropBoxesData } = this.state;

    if (cropBoxesData.length === 0) {
      alert("Please select a region in the image to continue.");
      return;
    }

    const allText = cropBoxesData.map((box) => box.ocrText).join('\n');

    const blob = new Blob([allText], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    var currentdate = new Date();
    var datetime = "AccurateOCR_" + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + "@" + currentdate.getHours() + "_" + currentdate.getMinutes() + "_" + currentdate.getSeconds();
    a.download = `${datetime}.txt`;

    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * @Card_UI
  * */

  renderCropBox(datas, images, params) {
    const language = this.state.language;
    const modality = this.state.modality;
    const ocrVersion = this.state.ocrVersion;
    const layoutVersion = this.state.layoutVersion;
    const server = this.state.server;

    if (
      datas == null ||
      datas.length === 0 ||
      images == null ||
      images.length === 0 ||
      params.types === null ||
      params === null
    ) {
      return <div>
        <h1 className="font-semibold text-lg">Select a region in the image to continue, or click on Instructions for further details.</h1>
      </div>;
    }

    const { cropBoxesData } = this.state;
    console.log(cropBoxesData);
    let res = [];

    for (let i = 0; i < datas.length; ++i) {
      let data = datas[i];
      let ocrText = cropBoxesData[i] && cropBoxesData[i].ocrText ? cropBoxesData[i].ocrText : "";
      let actived = this.cropper.getNowCropBoxIndex() === i;
      let displaycolor = actived ? "#bee3f8" : "#ebf8ff";
      let boxShadow = actived ? "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px" : "white";

      let collection = this.state.boundingBoxCollection[i];
      
      let typex, colorx;
      if (collection) {
        typex = collection.category;
        if (typex === "Paragraph") {
          colorx = "purple";
        } else if (typex === "Heading") {
          colorx = "red";
        } else if (typex === "Table") {
          colorx = "green";
        } else if (typex === "Image") {
          colorx = "blue";
        } else if (typex === "Equation") {
          colorx = "yellow";
        }
      }

      if (this.state.cropBoxesData[i] && this.state.cropBoxesData[i].ocrText) {
        ocrText = this.state.cropBoxesData[i].ocrText;
      }

      const wordCount = this.wordsLen(ocrText);

      const label = i + 1;

      let labelPositionX, labelPositionY;

      if(collection){
        labelPositionX = collection.coordinates.x;
        labelPositionY = collection.coordinates.y;
        labelPositionY -= 40;
      }

      res.push(
        <div
          key={i}
          onClick={this.handleToActiveCropBox}
          cardindex={i}
          className="pb-4"
        >
          {/**  image preview */}

          {/* {<div style={{ float: "left", width: "60%" }}>
            <div
              className="cimg-preview-block"
              style={{ width: "100%", height: 128, overflow: "hidden" }}
              align={"center"}
              dangerouslySetInnerHTML={{ __html: images[i].outerHTML }}
            />
          </div>} */}

          <div style={{ position: 'absolute', top: labelPositionY, left: labelPositionX, background: 'black', color: 'white', padding: '4px', borderRadius: '4px', zIndex: 10 }}>{label}</div>

          <Cardx width={600} backgroundColor={displaycolor} boxShadow={boxShadow}>
            <CardBody className="flex justify-between">
              <div className="flex gap-x-4">
                <Heading size="md">{"Region" + (i + 1)}</Heading>
                <div>
                  <Badge colorScheme={colorx}>{typex}</Badge>
                </div>
              </div>

              <Flex className="py-2 px-10 gap-x-10">
                <RiFileCopyFill
                  className="cursor-pointer"
                  onClick={() => this.handleCopyOCRText(i)}
                />
                <RxReload
                  className="cursor-pointer"
                  onClick={() => this.handleReloadOCRText(i)}
                />
                <MdDeleteForever
                  className="cursor-pointer"
                  color="red"
                  cropboxindex={i}
                  onClick={this.handleToDestroyCropBox}
                />
              </Flex>
            </CardBody>

            <div className="flex justify-center gap-x-2 pb-4">
              <Badge colorScheme="blue">{server}</Badge>
              <Badge colorScheme="purple">{language}</Badge>
              <Badge colorScheme="green">{modality}</Badge>
              <Badge variant="outline" colorScheme="green">
                {ocrVersion}
              </Badge>
              <Badge variant="outline" colorScheme="green">
                {layoutVersion}
              </Badge>
              <Badge>Words: {wordCount}</Badge>
            </div>

            <Divider />

            <div className="flex py-2">
              <InputGroup px={2}>
                <InputLeftAddon>X</InputLeftAddon>
                <Inputx
                  type="text"
                  placeholder="X Value"
                  width="60px"
                  value={Math.round(data.x)}
                />
              </InputGroup>
              <InputGroup px={2}>
                <InputLeftAddon>Y</InputLeftAddon>
                <Inputx
                  type="text"
                  placeholder="Y Value"
                  width="60px"
                  value={Math.round(data.y)}
                />
              </InputGroup>
              <InputGroup px={2}>
                <InputLeftAddon>W</InputLeftAddon>
                <Inputx
                  type="text"
                  placeholder="W value"
                  width="60px"
                  value={Math.round(data.width)}
                />
              </InputGroup>
              <InputGroup px={2}>
                <InputLeftAddon>H</InputLeftAddon>
                <Inputx
                  type="text"
                  placeholder="H value"
                  width="60px"
                  value={Math.round(data.height)}
                />
              </InputGroup>
            </div>

            <Divider />

            {
              (typex === "Paragraph" || typex === "Heading" || typex === "Table") ?
               (
                <div>
                <div style={{ padding: "1rem" }}>
                  <Textarea
                    size="sm"
                    placeholder={this.state.loading ? "Loading..." : "OCR Text"}
                    value={ocrText}
                    onChange={(e) => this.handleOCRTextChange(i, e)}
                  />
                </div>
                <Divider />

                <CardFooter>
                  <div className="flex justify-center gap-x-6">
                    <SelectLanguage
                      language={this.state.language}
                      onLanguageChange={this.handleLanguageChange}
                    />
                    <SelectModality modality={modality} />
                    <SelectOCRVersion ocrVersion={ocrVersion} />
                    <SelectLayoutVersion layoutVersion={layoutVersion} />
                  </div>
                </CardFooter>
              </div> 
               ) :  
              (
                <div>
                  <CardFooter>
                    {typex} Embedded
                  </CardFooter>
                </div>
            )
            }
          </Cardx>
        </div>
      );
    }
    return <div>{res}</div>;
  }
}

const SelectLanguage = ({ language, onLanguageChange }) => {

  const handleChange = (value) => {
    onLanguageChange(value);
  };

  /**
   * @Individual_controls_UI
  * */

  return (
    <Select
      defaultValue={language || "english"}
      placeholder="Language"
      onChange={handleChange}
    >
      <option value="english">English</option>
      <option value="assamese">Assamese</option>
      <option value="gujarati">Gujarati</option>
      <option value="hindi">Hindi</option>
      <option value="kannada">Kannada</option>
      <option value="malayalam">Malayalam</option>
      <option value="manipuri">Manipuri</option>
      <option value="marathi">Marathi</option>
      <option value="oriya">Oriya</option>
      <option value="punjabi">Punjabi</option>
      <option value="tamil">Tamil</option>
      <option value="telugu">Telugu</option>
      <option value="urdu">Urdu</option>
    </Select>
  );
};

const SelectModality = ({ modality: selectedModality }) => {
  const [modality, setModality] = useState(selectedModality || "Printed");

  const handleChange = (value) => {
    setModality(value);
  };

  return (
    <Select
      defaultValue={modality}
      placeholder="Modality"
      onChange={handleChange}
    >
      <option value="Printed">Printed</option>
      <option value="Handwritten">Handwritten</option>
      <option value="Scene Text">Scene Text</option>
    </Select>
  );
};

const SelectOCRVersion = ({ ocrVersion: selectedOcrVersion }) => {
  const [ocrVersion, setOCRVersion] = useState(
    selectedOcrVersion || "V-01.04.01.00"
  );

  const handleChange = (value) => {
    setOCRVersion(value);
  };

  return (
    <Select
      defaultValue={ocrVersion}
      placeholder="OCR Version"
      onChange={handleChange}
    >
      <option value="V-01.04.00.00">V-01.04.00.00</option>
      <option value="V-01.04.01.00">V-01.04.01.00</option>
      <option value="V-01.04.02.00">V-01.04.02.00</option>
      <option value="V-01.04.03.00">V-01.04.03.00</option>
      <option value="V-01.04.00.14+u">V-01.04.00.14+u</option>
      <option value="V-01.04.01.14+u">V-01.04.01.14+u</option>
      <option value="Tesseract V4">Tesseract V4</option>
      <option value="OpenEnglish">OpenEnglish</option>
    </Select>
  );
};

const SelectLayoutVersion = ({ layoutVersion: selectedOcrVersion }) => {
  const [layoutVersion, setLayoutVersion] = useState(
    selectedOcrVersion || "V-01.00.01"
  );

  const handleChange = (value) => {
    setLayoutVersion(value);
  };

  return (
    <Select
      defaultValue={layoutVersion}
      placeholder="Layout Version"
      onChange={handleChange}
    >
      <option value="V-01.00.01">V-01.00.01</option>
      <option value="V-01.10.00">V-01.10.00</option>
      <option value="V-01.01.01">V-01.01.01</option>
    </Select>
  );
};

export default App;

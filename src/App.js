import React, { Component, useState } from "react";
import axios from "axios";

// UI Imports
import { Select, Button } from "antd";
import { Card as Cardx, CardHeader, CardBody, CardFooter, Image, Stack, Heading, Text, Divider, ButtonGroup, Box, Input as Inputx, InputGroup, InputLeftAddon, Grid, Textarea, Flex, Badge, Tooltip } from "@chakra-ui/react";
import { RiFileCopyFill } from "react-icons/ri";
import { RxReload } from "react-icons/rx";
import { MdDeleteForever } from "react-icons/md";

// CSS Import
import "./App.css";

// Componennts Import
import Cropper from "./multi-cropper/cropper";
import * as $ from "./multi-cropper/src/js/utilities";
import Navbar from "./components/Navbar";
import Controls from "./components/Controls";


const Option = Select.Option;

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
    };
  }

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
  
  handleMouseUp () {
    console.log("Iam")
    document.removeEventListener("mouseup", this.handleMouseUp);
    const cropBoxDatas = this.cropper.getCropBoxDatas();
    console.log(cropBoxDatas);
    this.setState({ loading: false });
  
    const updatedCropBoxesData = cropBoxDatas.map((cropBoxData, index) => {
      const existingCropBoxData = this.state.cropBoxesData[index] || {};
      return {
        ...existingCropBoxData,
        ...cropBoxData,
      };
    });
  
    // Update the state with the new crop box datas
    this.setState(
      {
        cropBoxesData: updatedCropBoxesData,
      },
      () => {
        this.sendCroppedImages({ language: "english", modality: "printed" });
      }
    );
  }
  
  
  // Cropbox events
  destroyCropBox(event) {
    this.forceUpdate();
  }

  moveEnd = (event) => {
    this.forceUpdate();
  };

  cropBuildOver = (event) => {
    console.log(event);
  };

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
 
  async sendCroppedImages(options) {
    try {
      this.setState({ loading: true });
      const croppedImages = await this.getCroppedImages();
      console.log(croppedImages);

      const language = this.state.language;

      console.log("length is" + croppedImages.length);
      for (let i = 0; i < croppedImages.length; i++) {
        const formData = new FormData();
        formData.append("image", croppedImages[i]);
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

        console.log("API call success");

        let ocr = response.data.text;

        // console.log(ocr);
        this.setState({ loading: false });

        const updatedCropBoxesData = [...this.state.cropBoxesData];
        updatedCropBoxesData[i] = {
          ...updatedCropBoxesData[i],
          ocrText: ocr,
        };

        this.setState({ cropBoxesData: updatedCropBoxesData });
      }
    } catch (error) {
      console.error("Error sendingCroppedImages" + error);
    }
  }

  cropImage() {
    this.cropper.crop();
    this.sendCroppedImages();
  }

  handleSaveAndRun(){
    this.sendCroppedImages();
  }

  render() {
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
        {this.state.imgSrc && (
          <div className="p-10">
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
    );
  }

  /**
   * @handling_functions
  * */

  handleToDestroyCropBox = (event) => {
    const index = event.currentTarget.getAttribute("cropboxindex");
    if (index !== null) {
      const cropBoxIndex = parseInt(index, 10);
      const activeCropBoxIndex = this.cropper.getNowCropBoxIndex();
      // If the clicked crop box is active, destroy it
      if (cropBoxIndex === activeCropBoxIndex) {
        this.cropper.destroyCropBoxByIndex(cropBoxIndex);
      }
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
      console.log("current language on reload is "+ this.state.language);

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

    if(cropBoxesData.length === 0){
      alert("Please select a region in the image to continue.");
      return;
    }

    const allText = cropBoxesData.map((box) => box.ocrText).join('\n');
  
    const blob = new Blob([allText], { type: 'text/plain' });
  
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    var currentdate = new Date(); 
    var datetime = "AccurateOCR_" + currentdate.getDate() + "/" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear() + "@" + currentdate.getHours() + "_" + currentdate.getMinutes() + "_"+ currentdate.getSeconds();
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
    let res = [];

    for (let i = 0; i < datas.length; ++i) {
      let data = datas[i];
      let ocrText =
        cropBoxesData[i] && cropBoxesData[i].ocrText
          ? cropBoxesData[i].ocrText
          : "";
      let actived = this.cropper.getNowCropBoxIndex() === i;
      let displaycolor = actived ? "#bee3f8" : "#ebf8ff";
      let boxShadow = actived? "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px" : "white";

      if (this.state.cropBoxesData[i] && this.state.cropBoxesData[i].ocrText) {
        ocrText = this.state.cropBoxesData[i].ocrText;
      }

      const wordCount = this.wordsLen(ocrText);

      const label = i + 1;

      const labelPositionX = data.x + 20; 
      const labelPositionY = data.y + 100;

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
              <Stack spacing="3">
                <Heading size="md">{"Region" + (i + 1)}</Heading>
              </Stack>

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
            <div style={{ padding: "1rem" }}>
              <Textarea
                size="sm"
                placeholder= {this.state.loading ? "Loading..." : "OCR Text" }
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
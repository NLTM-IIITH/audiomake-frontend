import React, { useRef, useState } from "react";
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Select, FormControl, FormLabel, Divider } from "@chakra-ui/react";

import { GoDownload } from "react-icons/go";
import { IoSaveSharp } from "react-icons/io5";
import { ImUpload } from "react-icons/im";

const Controls = ({ onSendRequest, onLanguageChange, onSaveAndRun, onDownloadText}) => {
  const drawerDisclosure = useDisclosure();
  const modalDisclosure = useDisclosure();
  const btnRef = useRef();

  const [language, setLanguage] = useState("english");
  const [modality, setModality] = useState("printed");
  const [server, setServer] = useState("bhashini");

  const handleSendRequest = () => {
    // Call the parent component's function and pass selected values
    onSendRequest({ language, modality, server });
  };

  const handleSaveAndRun = () => {
    onSaveAndRun();
  };

  return (
    <div className="flex py-2 justify-center gap-x-4">
      <div>
        <Button
          ref={btnRef}
          colorScheme="teal"
          onClick={drawerDisclosure.onOpen}
        >
          Page Settings
        </Button>
        <Drawer
          isOpen={drawerDisclosure.isOpen}
          size="md"
          placement="left"
          onClose={drawerDisclosure.onClose}
          finalFocusRef={btnRef}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Page Settings</DrawerHeader>

            <DrawerBody>
              <FormControl className="py-2">
                <FormLabel>Server (ULCA Compliant)</FormLabel>
                <Select
                  defaultValue={server}
                  placeholder="Select Server"
                  onChange={(e) => {setServer(e.target.value)}}
                >
                  <option value="bhashini">Bhashini</option>
                  <option value="IIITH">IIITH</option>
                  <option value="dhruva">Dhruva</option>
                </Select>
              </FormControl>

              <FormControl className="py-2">
                <FormLabel>OCR Version</FormLabel>
                <Select defaultValue="V-01.04.01.00" placeholder="OCR Version">
                  <option value="V-01.04.00.00">V-01.04.00.00</option>
                  <option value="V-01.04.01.00">V-01.04.01.00</option>
                  <option value="V-01.04.02.00">V-01.04.02.00</option>
                  <option value="V-01.04.03.00">V-01.04.03.00</option>
                  <option value="V-01.04.00.14+u">V-01.04.00.14+u</option>
                  <option value="V-01.04.01.14+u">V-01.04.01.14+u</option>
                  <option value="Tesseract V4">Tesseract V4</option>
                  <option value="OpenEnglish">OpenEnglish</option>
                </Select>
              </FormControl>

              <FormControl className="py-2">
                <FormLabel>Layout Version</FormLabel>
                <Select defaultValue="V-01.00.01" placeholder="Layout Version">
                  <option value="V-01.00.01">V-01.00.01</option>
                  <option value="V-01.10.00">V-01.10.00</option>
                  <option value="V-01.01.01">V-01.01.01</option>
                </Select>
              </FormControl>

              <Divider
                borderColor="gray.400"
                borderWidth="2px"
                className="my-4"
              />

              <FormControl className="py-2">
                <FormLabel>Language</FormLabel>
                <Select
                  defaultValue={language}
                  placeholder="Language"
                  onChange={(e) => {
                    onLanguageChange(e.target.value);
                    setLanguage(e.target.value);
                  }}
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
              </FormControl>

              <FormControl className="py-2">
                <FormLabel>Modality</FormLabel>
                <Select
                  defaultValue={modality}
                  placeholder="Modailty"
                  onChange={(e) => setModality(e.target.value)}
                >
                  <option value="printed">Printed</option>
                  <option value="handwritten">Handwritten</option>
                  <option value="sceneText">Scene Text</option>
                </Select>
              </FormControl>
            </DrawerBody>

            <DrawerFooter>
              <Button
                variant="outline"
                mr={3}
                onClick={drawerDisclosure.onClose}
              >
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSaveAndRun}>
                Save and Re-Run
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <div>
        <Button onClick={modalDisclosure.onOpen} colorScheme="twitter">
          Instructions
        </Button>
        <Modal
          isOpen={modalDisclosure.isOpen}
          onClose={modalDisclosure.onClose}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Instructions to Use</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <div>
                <ul className="list-disc pl-4">
                  <li>
                    Change and confirm the page level settings from the Page
                    Settings button:
                    <ul className="list-disc pl-4">
                      <li>Select the Segmentation model.</li>
                      <li>Select the OCR Model.</li>
                      <li>Select the modality of the document.</li>
                      <li>Select the language of the document.</li>
                    </ul>
                  </li>
                </ul>
                <ul className="list-disc pl-4">
                  <li>
                    Select any text region from the image using mouse-drag.
                  </li>
                  <li>Double-tap on the region to delete the crop or use the delete key.</li>
                  <li>Scroll the mouse on the image to zoom-in and zoom-out</li>
                </ul>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={modalDisclosure.onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <Button colorScheme="whatsapp" onClick={() => onDownloadText()}>
        <GoDownload className="mr-2" />
        Text
      </Button>
      <Button colorScheme="whatsapp">
        <IoSaveSharp className="mr-2" />
        Save
      </Button>
      <Button colorScheme="whatsapp">
        <ImUpload className="mr-2" />
        Load
      </Button>
    </div>
  );
};

export default Controls;

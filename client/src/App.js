import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { useDropzone } from 'react-dropzone';
import { CircularProgress } from "@mui/material";
import "./App.css"; 
import logo from './Logo_white.webp'; 
import { RxCross1 } from "react-icons/rx"; 
import { AiOutlineArrowLeft } from "react-icons/ai"; 

const App = () => {
  const [context, setContext] = useState("");
  const [images, setImages] = useState([]);
  const [instructions, setInstructions] = useState();
  const [loading, setLoading] = useState(false);

  
  const onDrop = (acceptedFiles) => {
    setImages(prevImages => [
      ...prevImages, 
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*', 
    multiple: true 
  });

  const handleRemoveImage = (name) => {
    setImages(images.filter((file) => file.name !== name));
  };

  const handleSubmit = async () => {
    if (!images.length) {
      alert("Please upload at least one screenshot.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("context", context);
    images.forEach((image) => {
      formData.append("images", image);
    });

    
    try {
      const response = await fetch("http://localhost:5000/api/myracle", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Result:", result);
      setInstructions(result.description);
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
  
    setContext("");
    setImages([]);
    setInstructions(null);
  };

  return (
    <div className="App flex flex-col items-center justify-center min-h-screen p-8" style={{ background: 'linear-gradient(90deg, #ff5f7e, #ff7597, #7a70eb, #664bdb)' }}>
    
      <div className="absolute top-4 left-4">
        <img src={logo} alt="Logo" className="h-12 w-auto" />
      </div>

    
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 flex items-center text-white bg-[#9968f2] p-2 rounded-full hover:bg-[#ff5f7e] transition-colors"
      >
        <AiOutlineArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <h1 className="text-4xl font-bold text-white mb-6">
        Auto Tester
      </h1>

     
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full transition-transform transform hover:scale-105 hover:shadow-2xl">
        <label htmlFor="context" className="text-lg font-semibold mb-2 block text-gray-800">
          Context (optional):
        </label>
        <textarea
          className="border-gray-300 border-2 p-3 w-full mb-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
          id="context"
          rows="4"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Enter any additional context here..."
        ></textarea>

        
        <div {...getRootProps({ className: 'dropzone p-6 border-2 border-dashed border-gray-300 rounded-lg mb-6 text-center cursor-pointer transition duration-200 hover:border-blue-400' })}>
          <input {...getInputProps()} />
          {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag & Drop your screenshots or <span className="text-blue-500 underline">Browse</span></p>
          }
        </div>

       
        <div className="grid grid-cols-2 gap-4 mb-4">
          {images.map((file) => (
            <div key={file.name} className="relative flex flex-col items-center">
              <img src={file.preview} alt={file.name} className="w-20 h-20 object-cover rounded-lg shadow-sm" />
              <button 
                onClick={() => handleRemoveImage(file.name)} 
                className="absolute top-0 right-0 bg-white rounded-full p-1 text-red-500 hover:bg-red-100">
                <RxCross1 size={14} />
              </button>
              <span className="text-xs text-gray-600 mt-1">{file.name}</span>
            </div>
          ))}
        </div>

     
        <div className="mt-4 flex justify-center items-center">
          {loading ? (
            <CircularProgress />
          ) : (
            <button
              className="bg-[#9968f2] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#ff5f7e] focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={handleSubmit}
            >
              Describe Testing Instructions
            </button>
          )}
        </div>
      </div>

      {instructions && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Testing Instructions
          </h2>
          <ReactMarkdown className="prose prose-lg">{instructions}</ReactMarkdown>
   
          <ReactMarkdown className="prose prose-lg">{instructions}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useState } from 'react';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [company, setCompany] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(false);


  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const maxWidth = 300;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(resizedBase64.split(',')[1]);
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const addProduct = async () => {
    if (!name || !price || !category || !company || !imageFile) {
      setError(true);
      return;
    }

    const userId = JSON.parse(localStorage.getItem('user'))._id;

    try {
      const resizedImage = await resizeImage(imageFile);

      const payload = {
        name,
        price,
        category,
        company,
        userId,
        image: resizedImage, 
        imageType: imageFile.type
      };
      let result = await fetch('http://localhost:5000/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      result = await result.json();
      console.warn(result);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <div className='product'>
      <h1>Add Product</h1>
      <input className="inputBox" type="text" placeholder='Enter product name' value={name} onChange={(e) => setName(e.target.value)} />
      {error && !name && <span className='invalid-input'>Enter valid Name</span>}

      <input className="inputBox" type="text" placeholder='Enter product price' value={price} onChange={(e) => setPrice(e.target.value)} />
      {error && !price && <span className='invalid-input'>Enter valid Price</span>}

      <input className="inputBox" type="text" placeholder='Enter product category' value={category} onChange={(e) => setCategory(e.target.value)} />
      {error && !category && <span className='invalid-input'>Enter valid Category</span>}

      <input className="inputBox" type="text" placeholder='Enter product company' value={company} onChange={(e) => setCompany(e.target.value)} />
      {error && !company && <span className='invalid-input'>Enter valid Company</span>}

      <input className="inputBox" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
      {error && !imageFile && <span className='invalid-input'>Select an image</span>}

      <button onClick={addProduct} className='appbutton'>Add Product</button>
    </div>
  );
};

export default AddProduct;

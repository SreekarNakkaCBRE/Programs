import React, { useState } from 'react';


function Calculator() {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [result, setResult] = useState(null);
    const [count, setCount] = useState(0);
    const [pic, setPic] = useState(null);

    const increment = () => {
        setCount(count + 1);
    }

    const decrement = () => {
        setCount(count - 1);
    }

    const handleAddition = () => {
        setResult(num1 + num2);
    };

    const handleSubtraction = () => {
        setResult(num1 - num2);
    };

    const handleMultiplication = () => {
        setResult(num1 * num2);
    };

    const handleDivision = () => {
        if (num2 !== 0) {
            setResult(num1 / num2);
        } else {
            alert("Cannot divide by zero"); 
        }
    };  

    const handlePicUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

  return (
    <div>
      <h1>Calculator Component</h1>
        <input 
            type="number" 
            value={num1} 
            onChange={(e) => setNum1(Number(e.target.value))} 
            placeholder="Enter first number"
            ></input>
        <input 
            type="number" 
            value={num2} 
            onChange={(e) => setNum2(Number(e.target.value))} 
            placeholder="Enter second number"
            ></input>
        <div>
            <button onClick={handleAddition}>Add</button>
            <button onClick={handleSubtraction}>Subtract</button>
            <button onClick={handleMultiplication}>Multiply</button>
            <button onClick={handleDivision}>Divide</button>
        </div>
        <h2>Result: {result}</h2>

        <div>
            <h1>Count : {count}</h1>
            <button onClick={increment}>Increment</button>
            <button onClick={decrement}>Decrement</button>
        </div>

        <div>
            <input type="file" onChange={handlePicUpload} />
            {pic && <img src={pic} alt="Uploaded" />}
        </div>
    </div>
  );
}

export default Calculator;

import { useState } from 'react';
import './App.css';

function App() {
	const [data, setData] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();

		const payload = {
			data: data,
		};

		try {
			const response = await fetch('http://localhost:8000/data', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			console.log(result);
			alert('Sent');

			setData('');

		} catch (error) {
			console.error('Error:', error);
			alert('Failed to push');
		}
	};

	return (
		<>
			<div className="App">
				<form onSubmit={handleSubmit} autoComplete="off">
					<div>
						<label htmlFor="data">Input</label>
						<br />
						<input
							type="text"
							id="data"
							value={data}
							onChange={(e) => setData(e.target.value)}
							placeholder="What's on your mind?"
							required
						/>
					</div>
					<br />
					<button type="submit">Submit</button>
				</form>
			</div>
		</>
	);
}

export default App;

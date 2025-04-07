import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

const generations = [
  { gen: 'Generation I', offset: 0, limit: 151 },
  { gen: 'Generation II', offset: 151, limit: 100 },
  { gen: 'Generation III', offset: 251, limit: 135 },
  { gen: 'Generation IV', offset: 386, limit: 107 },
  { gen: 'Generation V', offset: 493, limit: 156 },
  { gen: 'Generation VI', offset: 649, limit: 72 },
  { gen: 'Generation VII', offset: 721, limit: 88 },
  { gen: 'Generation VIII', offset: 809, limit: 89 },
];

function PokemonDetail() {
  const [pokemon, setPokemon] = useState(null);
  const [search, setSearch] = useState('pikachu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPokemon = (pokemonName) => {
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
      .then(response => {
        if (!response.ok) throw new Error('Pokémon not found');
        return response.json();
      })
      .then(data => {
        setPokemon(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setPokemon(null);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPokemon(search);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPokemon(search);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Learn About APIs Using Pokédex</h2>
        <p>An API (Application Programming Interface) allows software applications to communicate with each other. This Pokédex demonstrates fetching data dynamically from an external source.</p>

        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter Pokémon name"
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <button type="submit" style={{ padding: '15px', fontSize: '18px', marginLeft: '10px' }}>
            Search
          </button>
        </form>

        {loading && <p>Fetching data from Pokémon API...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {pokemon && (
          <div>
            <h2>{pokemon.name.toUpperCase()}</h2>
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              style={{ width: '200px', height: '200px' }}
            />
            <p><strong>Height:</strong> {pokemon.height}</p>
            <p><strong>Weight:</strong> {pokemon.weight}</p>
            <p><strong>Types:</strong> {pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
            <p><strong>HTTP Method Used:</strong> GET (retrieve data)</p>
            <p><strong>Endpoint Used:</strong> https://pokeapi.co/api/v2/pokemon/{pokemon.name.toLowerCase()}</p>

            <details style={{ marginTop: '20px', maxHeight: '300px', overflow: 'auto', width: '80%', margin: 'auto' }}>
              <summary style={{ cursor: 'pointer' }}>View Raw JSON Data</summary>
              <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{JSON.stringify(pokemon, null, 2)}</pre>
            </details>
          </div>
        )}

        <Link to="/top100">
          <button style={{ marginTop: '20px', padding: '15px', fontSize: '18px' }}>Explore Top Pokémon by Generation</button>
        </Link>
      </header>
    </div>
  );
}

function Top100Pokemon() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generation, setGeneration] = useState(generations[0]);

  const fetchPokemons = (offset, limit) => {
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
      .then(response => response.json())
      .then(async data => {
        const detailedPokemons = await Promise.all(
          data.results.map(async (pokemon) => {
            const response = await fetch(pokemon.url);
            return response.json();
          })
        );
        setPokemons(detailedPokemons);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPokemons(generation.offset, generation.limit);
  }, [generation]);

  const handleGenerationClick = (gen) => {
    setGeneration(gen);
    fetchPokemons(gen.offset, gen.limit);
  };

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (error) {
    return <div className="App">Error fetching data</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{generation.gen} Pokémon</h1>

        <div style={{ marginBottom: '20px' }}>
          {generations.map((gen, index) => (
            <button
              key={index}
              style={{ padding: '10px', margin: '5px', cursor: 'pointer' }}
              onClick={() => setGeneration(gen)}
            >
              {gen.gen}
            </button>
          ))}
        </div>

        <table style={{ width: '80%', margin: 'auto', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Height</th>
              <th>Weight</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {pokemons.map((pokemon, index) => (
              <tr key={index}>
                <td><img src={pokemon.sprites.front_default} alt={pokemon.name} width="50" /></td>
                <td>{pokemon.name.toUpperCase()}</td>
                <td>{pokemon.height}</td>
                <td>{pokemon.weight}</td>
                <td>{pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/">
          <button style={{ marginTop: '20px', padding: '15px', fontSize: '18px' }}>Back to Pokédex Search</button>
        </Link>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonDetail />} />
        <Route path="/top100" element={<Top100Pokemon />} />
      </Routes>
    </Router>
  );
}

export default App;
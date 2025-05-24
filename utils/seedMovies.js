import fs from "fs"
import connectdb from "../src/DB.js";
import mongoose from "mongoose"
import dotenv from 'dotenv';


dotenv.config({
        path: './.env'

})

import { Movie } from "../models/movie.models.js"


connectdb()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("mongodb conncetion error !!!", err);
})

const movies = [
  {
    title: 'Parasite',
    director: 'Bong Joon Ho',
    releaseYear: 2019,
    genres: ['Comedy', 'Drama', 'Thriller'],
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    releaseYear: 2008,
    genres: ['Action', 'Crime', 'Drama'],
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    releaseYear: 1994,
    genres: ['Crime', 'Drama'],
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
  },
  {
    title: 'Spirited Away',
    director: 'Hayao Miyazaki',
    releaseYear: 2001,
    genres: ['Animation', 'Adventure', 'Family'],
    synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki'],
  }
];

// Import into DB
const importData = async () => {
  try {
    await Movie.deleteMany(); // Clear existing movies
    await Movie.insertMany(movies);
    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await Movie.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use the -i flag to import data or -d to delete data.');
  process.exit();
}






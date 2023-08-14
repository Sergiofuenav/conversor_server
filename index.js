const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const conversion = {
  r: "0",
  t: "1",
  d: "1",
  n: "2",
  ñ: "2",
  m: "3",
  c: "4",
  k: "4",
  q: "4",
  l: "5",
  s: "6",
  z: "6",
  f: "7",
  g: "8",
  j: "8",
  ch: "8",
  p: "9",
  v: "9",
  b: "9",
};

function descomponerPalabra(diccionario, palabra) {
  const n = palabra.length;

  function backtrack(i) {
    if (i >= n) {
      return [[]];
    }

    const soluciones = [];
    for (let j = i; j < n; j++) {
      const substring = palabra.substring(i, j + 1);
      if (diccionario.hasOwnProperty(substring)) {
        const subSoluciones = backtrack(j + 1);
        for (const subSol of subSoluciones) {
          soluciones.push([diccionario[substring], ...subSol]);
        }
      }
    }

    return soluciones;
  }

  const solucionesOptimas = backtrack(0);
  return solucionesOptimas.sort((a, b) => a.length - b.length);
}

function palabraANumero(palabra) {
  let numero = "";
  for (let idx = 0; idx < palabra.length; idx++) {
    const letra = palabra[idx];
    if (conversion.hasOwnProperty(letra)) {
      numero += conversion[letra];
    } else if (
      letra === "c" &&
      idx < palabra.length - 1 &&
      palabra[idx + 1] === "h"
    ) {
      numero += conversion["ch"];
    }
  }
  return numero;
}

function construirTrieDesdeArchivo(nombreArchivo) {
  const mapaNumerosAPalabras = {};
  try {
    const palabras = fs.readFileSync(nombreArchivo, "utf8").split("\n");

    palabras.forEach((palabra) => {
      const numero = palabraANumero(palabra);
      if (mapaNumerosAPalabras.hasOwnProperty(numero)) {
        mapaNumerosAPalabras[numero].push(palabra);
      } else {
        mapaNumerosAPalabras[numero] = [palabra];
      }
    });

    return mapaNumerosAPalabras;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`El archivo '${nombreArchivo}' no existe.`);
    } else {
      console.error("Ha ocurrido un error:", error);
    }
    return null;
  }
}

console.log("Creando diccionario");
const listaDiccionario = construirTrieDesdeArchivo("palabras.txt");

function convierteNumero(palabraADescomponer) {
  const soluciones = descomponerPalabra(listaDiccionario, palabraADescomponer);
  return soluciones.length > 0 ? soluciones[0] : [];
}

app.get("/convert/:word", (req, res) => {
  const word = req.params.word;
  const result = convierteNumero(word);
  res.json(result);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

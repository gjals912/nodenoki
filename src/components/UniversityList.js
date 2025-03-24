import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa"; // 🔍 아이콘 추가
import "./UniversityList.css";

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;
const SHEET_NAME = "국문";

const fetchData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  
  try {
    const response = await axios.get(url);
    return response.data.values;
  } catch (error) {
    console.error("API 요청 실패:", error);
    return [];
  }
};

export default function UniversityList() {
  const [universities, setUniversities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData().then((data) => {
      if (data.length === 0) return;
      const formattedData = data.slice(1).map((row) => ({
        name: row[0],
        type: row[1],
        department: row[2],
        phone: row[3],
        website: row[4],
        location: row[5],
        software: row[6]?.split(","),
        professor: {
          name: row[7],
          field: row[8],
          email: row[9],
        },
      }));
      setUniversities(formattedData);
    });
  }, []);

  // 🔹 검색 필터링 기능 추가
  const filteredUniversities = universities.filter((uni) =>
    `${uni.name} ${uni.department} ${uni.professor.name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="university-list">
      <h1>대학교 목록</h1>
      
      {/* 🔹 검색 입력 필드 & 버튼 추가 */}
      <div className="search-container">
        <input
          type="text"
          placeholder="대학, 학과, 교수님 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              console.log("검색 실행:", searchQuery);
            }
          }}
        />
        <button className="search-button">
          <FaSearch size={18} color="#fff" />
        </button>
      </div>

      <ul className="university-grid">
        {filteredUniversities.map((uni, index) => (
          <li key={index} className="university-card">
            <h2>{uni.name} ({uni.type})</h2>
            <p>학과: {uni.department}</p>
            <p>위치: {uni.location}</p>
            <p>사용 소프트웨어: {uni.software?.join(", ")}</p>
            <p>교수님: {uni.professor.name} - {uni.professor.field}</p>
            <a href={uni.website} target="_blank" rel="noopener noreferrer">웹사이트 방문</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

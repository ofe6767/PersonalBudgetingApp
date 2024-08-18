import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import './Report.css';

function Report() {
  
  const [report, setReport] = useState(null);

  const generateReport = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID is not found. Please log in.');
      return;
    }
  
    try {
      const response = await fetch(`/api/budgets/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
  
      if (result && result.data) {
        const { totalSpent, allocations } = result.data;
  
        const totalExpenses = Object.values(totalSpent).reduce((acc, value) => acc + (value < 0 ? Math.abs(value) : 0), 0);
        const totalIncome = Object.values(totalSpent).reduce((acc, value) => acc + (value > 0 ? value : 0), 0);
  
        const reportData = {
          totalExpenses,
          totalIncome,
          netIncome: totalIncome - totalExpenses,
          categories: Object.keys(totalSpent).map(key => ({
            category: key,
            spent: totalSpent[key] || 0,
            allocated: allocations[key.toLowerCase()] || 0
          }))
        };
  
        generatePDF(reportData);
  
      } else {
        console.error('Unexpected data structure:', result);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again later.');
    }
  };
  
  const generatePDF = (reportData) => {
    const { categories } = reportData;
  
    const totalExpenses = categories.reduce((acc, category) => acc + category.spent, 0);
  
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Financial Report', 14, 22);
  
    doc.setFontSize(12);
    doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, 32);
  
    if (categories && categories.length > 0) {
      let y = 42; 
      doc.setFontSize(14);
      doc.text('Category Details', 14, y);
  
      doc.setFontSize(11);
      categories.forEach((category, index) => {
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20; 
        }
        doc.text(`${category.category}: Spent $${category.spent.toFixed(2)}, Allocated $${category.allocated.toFixed(2)}`, 14, y);
      });
    }
  
    doc.save('financial_report.pdf');
  };
  
  return (
    <div className="report-container">
      <h2>Financial Report</h2>
      <button onClick={generateReport}>Generate Report</button>
      {report && (
        <div className="report-results">
          <p>Total Expenses: ${report.totalExpenses.toFixed(2)}</p>
          <p>Total Income: ${report.totalIncome.toFixed(2)}</p>
          <p>Net Income: ${report.netIncome.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default Report;

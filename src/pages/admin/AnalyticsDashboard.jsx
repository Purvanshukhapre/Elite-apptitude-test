import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/useApp';
import AdminLayout from '../../components/AdminLayout';
import { sampleQuestions } from '../../data/questions';
import AnimatedLineChart from '../../components/charts/AnimatedLineChart';
import SummaryCards from '../../components/analytics/SummaryCards';
import PerformanceInsights from '../../components/analytics/PerformanceInsights';
import PositionPerformance from '../../components/analytics/PositionPerformance';
import TimeRangeSelector from '../../components/analytics/TimeRangeSelector';

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { applicants, isAdminAuthenticated } = useApp();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [timeRange, setTimeRange] = useState('30days'); // Default to 30 days
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  // Start animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.05;
        setAnimationProgress(Math.min(progress, 1));
        if (progress >= 1) clearInterval(interval);
      }, 20);
      
      return () => clearInterval(interval);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter applicants based on time range
  const filterApplicantsByTime = (applicants, range) => {
    if (!applicants || applicants.length === 0) return [];
    
    const now = new Date();
    let cutoffDate;
    
    switch(range) {
      case '24hours':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return applicants;
    }
    
    return applicants.filter(applicant => {
      const submissionDate = new Date(applicant.submittedAt);
      return submissionDate >= cutoffDate;
    });
  };
  
  // Get filtered applicants based on time range
  const filteredApplicants = useMemo(() => {
    return filterApplicantsByTime(applicants, timeRange);
  }, [applicants, timeRange]);

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!filteredApplicants || filteredApplicants.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        positionStats: {},
        categoryScores: {},
        timeStats: {
          avgTimePerQuestion: 0,
          totalTime: 0
        }
      };
    }

    let passed = 0;
    let totalScore = 0;
    const positionStats = {};
    const categoryScores = {};
    let totalQuestionTime = 0;
    let answeredQuestions = 0;

    filteredApplicants.forEach(applicant => {
      if (!applicant.testData) return;
      
      const score = parseFloat(applicant.testData.percentage) || 0;
      totalScore += score;
      
      if (score >= 60) passed++;
      
      const position = applicant.position || 'Unknown';
      if (!positionStats[position]) {
        positionStats[position] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      positionStats[position].count++;
      positionStats[position].totalScore += score;

      // Process answers to calculate category scores
      if (applicant.testData && applicant.testData.answers) {
        Object.entries(applicant.testData.answers).forEach(([questionId, answerData]) => {
          const question = sampleQuestions.find(q => q.id === parseInt(questionId));
          if (!question) return;
          
          const category = question.category;
          const isCorrect = answerData.isCorrect ? 1 : 0;
          
          if (!categoryScores[category]) {
            categoryScores[category] = { correct: 0, total: 0, percentage: 0 };
          }
          categoryScores[category].correct += isCorrect;
          categoryScores[category].total += 1;
          
          // Track time spent
          if (answerData.timeSpent) {
            totalQuestionTime += answerData.timeSpent;
            answeredQuestions++;
          }
        });
      }
    });

    // Calculate average scores for each position
    Object.keys(positionStats).forEach(position => {
      const stats = positionStats[position];
      stats.avgScore = Math.round(stats.totalScore / stats.count);
    });

    // Calculate category percentages
    Object.keys(categoryScores).forEach(category => {
      const stats = categoryScores[category];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return {
      total: filteredApplicants.length,
      passed,
      failed: filteredApplicants.length - passed,
      averageScore: Math.round(totalScore / filteredApplicants.filter(a => a.testData).length || 1),
      positionStats,
      categoryScores,
      timeStats: {
        avgTimePerQuestion: answeredQuestions > 0 ? Math.round(totalQuestionTime / answeredQuestions) : 0,
        totalTime: totalQuestionTime
      }
    };
  }, [filteredApplicants]);

  // Generate chart data for different metrics
  const generateChartData = (metric, title, description, color, xAxis = 'date', yAxis = 'value') => {
    if (!filteredApplicants || filteredApplicants.length === 0) {
      return {
        data: [],
        minValue: 0,
        maxValue: 100,
        title,
        description,
        color,
        xAxis,
        yAxis
      };
    }

    // Filter applicants with test data
    const testDataAvailable = filteredApplicants.filter(a => a.testData);
    if (testDataAvailable.length === 0) {
      return {
        data: [],
        minValue: 0,
        maxValue: 100,
        title,
        description,
        color,
        xAxis,
        yAxis
      };
    }

    let data = [];
    
    switch(metric) {
      case 'performance':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.percentage) || 0
        }));
        break;
        
      case 'accuracy':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.percentage) || 0
        }));
        break;
        
      case 'speed':
        // Last 10 applicants by submission date
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.timeTaken) || 0
        }));
        break;
        
      case 'categories':
        // Category performance
        data = Object.entries(analytics.categoryScores).map(([category, stats]) => ({
          [xAxis]: category,
          [yAxis]: stats.percentage
        }));
        break;
        
      default:
        data = testDataAvailable.slice(-10).map((applicant, index) => ({
          [xAxis]: `Applicant ${index + 1}`,
          [yAxis]: parseFloat(applicant.testData.percentage) || 0
        }));
    }

    const values = data.map(d => d[yAxis]);
    const minValue = Math.min(...values, 0);
    const maxValue = Math.max(...values, 100);

    return {
      data,
      minValue,
      maxValue: maxValue === minValue ? maxValue + 10 : maxValue,
      title,
      description,
      color,
      xAxis,
      yAxis
    };
  };

  // Generate chart data
  const performanceData = generateChartData(
    'performance',
    'Student Performance Overview',
    'Overall test scores across recent applicants',
    '#3B82F6',
    'applicant',
    'Score (%)'
  );

  const accuracyData = generateChartData(
    'accuracy',
    'Accuracy Analysis',
    'Correct answers vs total questions',
    '#10B981',
    'applicant',
    'Accuracy (%)'
  );

  const speedData = generateChartData(
    'speed',
    'Response Time Analysis',
    'Average time taken per question',
    '#8B5CF6',
    'applicant',
    'Time (sec)'
  );

  const categoryData = generateChartData(
    'categories',
    'Category-wise Performance',
    'Performance breakdown by question categories',
    '#F59E0B',
    'category',
    'Score (%)'
  );

  return (
    <AdminLayout activeTab="analytics">
      {/* Main Content */}
      <div className="p-6 mx-auto">
        {/* Time Range Selector */}
        <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
        
        {/* Summary Cards - Clean visual hierarchy */}
        <SummaryCards analytics={analytics} filteredApplicants={filteredApplicants} />
        
        {/* Charts Grid - Polished containers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <AnimatedLineChart {...performanceData} />
          <AnimatedLineChart {...accuracyData} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <AnimatedLineChart {...speedData} />
          <AnimatedLineChart {...categoryData} />
        </div>
        
        {/* Insights Section */}
        <PerformanceInsights analytics={analytics} />
        
        {/* Position-wise Performance */}
        <PositionPerformance analytics={analytics} applicants={applicants} />
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
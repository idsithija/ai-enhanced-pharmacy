import Medicine from '../models/Medicine.js';

interface SalesRecord {
  medicineId: number;
  medicineName: string;
  date: Date;
  quantity: number;
  price: number;
}

interface PredictionResult {
  medicineId: number;
  medicineName: string;
  currentStock: number;
  averageDailySales: number;
  predictedDemand: number; // Next 7 days
  predictedDemand30Days: number;
  daysUntilStockout: number;
  recommendedReorderQuantity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: number;
  seasonalityFactor: number;
}

interface DemandSummary {
  predictions: PredictionResult[];
  criticalStockItems: PredictionResult[];
  highDemandItems: PredictionResult[];
  slowMovingItems: PredictionResult[];
}

/**
 * Simple Demand Prediction Service
 * Uses statistical forecasting (moving averages, trend analysis, seasonality)
 * Can be replaced with TensorFlow.js model later
 */
class DemandPredictionService {
  private salesHistory: SalesRecord[] = [];

  /**
   * Generate synthetic sales data for the last 6 months
   * In production, this would query from actual sales_items table
   */
  generateSyntheticSalesData(medicines: any[]): void {
    this.salesHistory = [];
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    // Generate daily sales for each medicine
    medicines.forEach((medicine: any) => {
      const baselineSales = this.getBaselineSales(medicine);
      
      for (let d = new Date(sixMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        
        // Add seasonality (some medicines sell more on certain days/months)
        const seasonalityFactor = this.getSeasonalityFactor(date, medicine);
        
        // Add random variation (±30%)
        const randomFactor = 0.7 + Math.random() * 0.6;
        
        // Add trend (some medicines gaining/losing popularity)
        const trendFactor = this.getTrendFactor(date, sixMonthsAgo, medicine);
        
        const quantity = Math.round(baselineSales * seasonalityFactor * randomFactor * trendFactor);
        
        if (quantity > 0) {
          this.salesHistory.push({
            medicineId: medicine.id,
            medicineName: medicine.name,
            date,
            quantity,
            price: medicine.selling_price,
          });
        }
      }
    });
  }

  /**
   * Get baseline daily sales based on medicine category
   */
  private getBaselineSales(medicine: any): number {
    const category = medicine.category?.toLowerCase() || '';
    
    // High-demand categories
    if (category.includes('pain') || category.includes('fever')) return 8;
    if (category.includes('antibiotic')) return 5;
    if (category.includes('vitamin')) return 6;
    if (category.includes('diabetes')) return 4;
    if (category.includes('blood pressure')) return 4;
    
    // Medium-demand
    if (category.includes('allergy')) return 3;
    if (category.includes('stomach')) return 3;
    
    // Random baseline for others
    return Math.floor(Math.random() * 5) + 1;
  }

  /**
   * Calculate seasonality factor (e.g., cold medicines sell more in winter)
   */
  private getSeasonalityFactor(date: Date, medicine: any): number {
    const month = date.getMonth(); // 0-11
    const category = medicine.category?.toLowerCase() || '';
    
    // Cold/Flu medicines peak in winter (Nov-Feb)
    if (category.includes('cold') || category.includes('cough')) {
      if (month >= 10 || month <= 1) return 1.5; // Nov-Feb
      if (month >= 2 && month <= 4) return 1.2; // Mar-May
      return 0.8; // Summer
    }
    
    // Allergy medicines peak in spring (Mar-May)
    if (category.includes('allergy')) {
      if (month >= 2 && month <= 4) return 1.6; // Spring
      return 0.9;
    }
    
    // Vitamins increase in winter
    if (category.includes('vitamin')) {
      if (month >= 10 || month <= 1) return 1.3;
      return 1.0;
    }
    
    // Most medicines have slight weekly seasonality (weekend dip)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.85; // Weekend
    
    return 1.0;
  }

  /**
   * Calculate trend factor (gradual increase/decrease over time)
   */
  private getTrendFactor(currentDate: Date, startDate: Date, medicine: any): number {
    const daysPassed = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const category = medicine.category?.toLowerCase() || '';
    
    // Some categories are growing in popularity
    if (category.includes('vitamin') || category.includes('supplement')) {
      return 1 + (daysPassed / 180) * 0.3; // 30% growth over 6 months
    }
    
    // Some are declining (being replaced by newer medicines)
    if (category.includes('old') || Math.random() < 0.1) {
      return 1 - (daysPassed / 180) * 0.2; // 20% decline
    }
    
    return 1.0; // Stable
  }

  /**
   * Calculate moving average for recent period
   */
  private calculateMovingAverage(medicineId: number, days: number): number {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    
    const recentSales = this.salesHistory.filter(
      (sale) => sale.medicineId === medicineId && sale.date >= startDate
    );
    
    const totalQuantity = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
    return totalQuantity / days;
  }

  /**
   * Detect trend direction
   */
  private detectTrend(medicineId: number): 'increasing' | 'stable' | 'decreasing' {
    const recent7Days = this.calculateMovingAverage(medicineId, 7);
    const previous30Days = this.calculateMovingAverage(medicineId, 30);
    
    const change = (recent7Days - previous30Days) / previous30Days;
    
    if (change > 0.15) return 'increasing';
    if (change < -0.15) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate seasonality factor for future predictions
   */
  private getFutureSeasonality(medicine: any): number {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7); // Predict for next week
    
    return this.getSeasonalityFactor(futureDate, medicine);
  }

  /**
   * Predict demand for a single medicine
   */
  predictDemand(medicine: any): PredictionResult {
    const medicineId = medicine.id;
    
    // Calculate various moving averages
    const avg7Days = this.calculateMovingAverage(medicineId, 7);
    const avg30Days = this.calculateMovingAverage(medicineId, 30);
    const avg90Days = this.calculateMovingAverage(medicineId, 90);
    
    // Weight recent data more heavily
    const averageDailySales = avg7Days * 0.5 + avg30Days * 0.3 + avg90Days * 0.2;
    
    // Get trend and seasonality
    const trend = this.detectTrend(medicineId);
    const seasonalityFactor = this.getFutureSeasonality(medicine);
    
    // Apply trend adjustment
    let trendMultiplier = 1.0;
    if (trend === 'increasing') trendMultiplier = 1.15;
    if (trend === 'decreasing') trendMultiplier = 0.85;
    
    // Predict next 7 days and 30 days
    const predictedDemand = Math.round(averageDailySales * 7 * seasonalityFactor * trendMultiplier);
    const predictedDemand30Days = Math.round(averageDailySales * 30 * seasonalityFactor * trendMultiplier);
    
    // Calculate days until stockout
    const currentStock = medicine.quantity || 0;
    const daysUntilStockout = averageDailySales > 0 
      ? Math.round(currentStock / (averageDailySales * seasonalityFactor * trendMultiplier))
      : 999;
    
    // Recommended reorder quantity (1 month supply + safety stock)
    const recommendedReorderQuantity = Math.round(predictedDemand30Days * 1.2);
    
    // Confidence based on data consistency
    const variance = Math.abs(avg7Days - avg30Days) / avg30Days;
    const confidence = Math.max(0.5, 1 - variance);
    
    return {
      medicineId,
      medicineName: medicine.name,
      currentStock,
      averageDailySales: Math.round(averageDailySales * 10) / 10,
      predictedDemand,
      predictedDemand30Days,
      daysUntilStockout,
      recommendedReorderQuantity,
      trend,
      confidence: Math.round(confidence * 100),
      seasonalityFactor: Math.round(seasonalityFactor * 100),
    };
  }

  /**
   * Get demand predictions for all medicines
   */
  async predictAllDemand(): Promise<DemandSummary> {
    try {
      // Fetch all medicines from database
      const medicines = await Medicine.findAll();
      
      // Generate synthetic data (in production, query from sales table)
      this.generateSyntheticSalesData(medicines);
      
      // Predict demand for each medicine
      const predictions: PredictionResult[] = medicines.map((medicine: any) => this.predictDemand(medicine));
      
      // Categorize predictions
      const criticalStockItems = predictions
        .filter((p: PredictionResult) => p.daysUntilStockout < 7 && p.daysUntilStockout > 0)
        .sort((a: PredictionResult, b: PredictionResult) => a.daysUntilStockout - b.daysUntilStockout)
        .slice(0, 10);
      
      const highDemandItems = predictions
        .filter((p: PredictionResult) => p.trend === 'increasing')
        .sort((a: PredictionResult, b: PredictionResult) => b.predictedDemand - a.predictedDemand)
        .slice(0, 10);
      
      const slowMovingItems = predictions
        .filter((p: PredictionResult) => p.averageDailySales < 1 && p.currentStock > 50)
        .sort((a: PredictionResult, b: PredictionResult) => a.averageDailySales - b.averageDailySales)
        .slice(0, 10);
      
      return {
        predictions,
        criticalStockItems,
        highDemandItems,
        slowMovingItems,
      };
    } catch (error: any) {
      console.error('Error predicting demand:', error);
      throw new Error('Failed to generate demand predictions');
    }
  }

  /**
   * Get prediction for specific medicine
   */
  async predictSingleMedicine(medicineId: number): Promise<PredictionResult> {
    try {
      const medicine = await Medicine.findByPk(medicineId);
      if (!medicine) {
        throw new Error('Medicine not found');
      }
      
      // Generate synthetic data
      const medicines = await Medicine.findAll();
      this.generateSyntheticSalesData(medicines);
      
      return this.predictDemand(medicine);
    } catch (error: any) {
      console.error('Error predicting single medicine demand:', error);
      throw error;
    }
  }
}

export const demandPredictionService = new DemandPredictionService();
export { PredictionResult, DemandSummary };

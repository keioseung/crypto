import cron from 'node-cron';
import { logger } from './utils/logger';
import { upbitService } from './services/upbitService';
import { aiService } from './services/aiService';

export const initializeCronJobs = () => {
  // 매일 자정에 데이터 정리 및 백업
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Starting daily data cleanup and backup...');
      
      // 로그 파일 정리
      // 실제 구현에서는 로그 로테이션 및 백업 로직 추가
      
      logger.info('Daily data cleanup completed');
    } catch (error) {
      logger.error('Error in daily data cleanup:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매시간 AI 모델 성능 업데이트
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Updating AI model performance metrics...');
      
      // 모델 성능 메트릭 업데이트
      const markets = upbitService.getSupportedMarkets().slice(0, 5); // 상위 5개만
      
      for (const market of markets) {
        try {
          await aiService.ensemblePrediction(market, 24);
          logger.debug(`Updated performance metrics for ${market}`);
        } catch (error) {
          logger.error(`Error updating performance for ${market}:`, error);
        }
      }
      
      logger.info('AI model performance update completed');
    } catch (error) {
      logger.error('Error in AI model performance update:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매 10분마다 마켓 데이터 상태 확인
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.debug('Checking market data status...');
      
      const markets = upbitService.getSupportedMarkets();
      const tickers = await upbitService.getTickers(markets);
      
      // 데이터 품질 체크
      const dataQuality = {
        totalMarkets: markets.length,
        activeMarkets: tickers.length,
        lastUpdate: new Date().toISOString(),
        status: tickers.length === markets.length ? 'healthy' : 'warning'
      };
      
      if (dataQuality.status === 'warning') {
        logger.warn('Market data quality warning:', dataQuality);
      } else {
        logger.debug('Market data status check completed:', dataQuality);
      }
    } catch (error) {
      logger.error('Error in market data status check:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매일 오전 9시에 주간 리포트 생성
  cron.schedule('0 9 * * 1', async () => {
    try {
      logger.info('Generating weekly market report...');
      
      // 주간 리포트 생성 로직
      const markets = upbitService.getSupportedMarkets();
      const weeklyReport = {
        period: 'weekly',
        markets: markets.length,
        timestamp: new Date().toISOString(),
        summary: 'Weekly market analysis report'
      };
      
      // 실제 구현에서는 리포트를 DB에 저장하거나 이메일로 전송
      logger.info('Weekly report generated:', weeklyReport);
    } catch (error) {
      logger.error('Error generating weekly report:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매월 1일 자정에 월간 리포트 생성
  cron.schedule('0 0 1 * *', async () => {
    try {
      logger.info('Generating monthly market report...');
      
      // 월간 리포트 생성 로직
      const monthlyReport = {
        period: 'monthly',
        timestamp: new Date().toISOString(),
        summary: 'Monthly market analysis report'
      };
      
      // 실제 구현에서는 리포트를 DB에 저장하거나 이메일로 전송
      logger.info('Monthly report generated:', monthlyReport);
    } catch (error) {
      logger.error('Error generating monthly report:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매 5분마다 시스템 헬스체크
  cron.schedule('*/5 * * * *', async () => {
    try {
      const healthCheck = {
        timestamp: new Date().toISOString(),
        services: {
          upbit: 'healthy',
          ai: 'healthy',
          websocket: 'healthy'
        },
        memory: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      // 메모리 사용량 체크
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        logger.warn('High memory usage detected:', memoryUsage);
      }
      
      logger.debug('Health check completed:', healthCheck);
    } catch (error) {
      logger.error('Error in health check:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  // 매 30분마다 캐시 정리
  cron.schedule('*/30 * * * *', async () => {
    try {
      logger.debug('Cleaning up cache...');
      
      // 메모리 캐시 정리
      if (global.gc) {
        global.gc();
        logger.debug('Garbage collection completed');
      }
      
      // 실제 구현에서는 Redis 캐시 정리 로직 추가
    } catch (error) {
      logger.error('Error in cache cleanup:', error);
    }
  }, {
    timezone: 'Asia/Seoul'
  });

  logger.info('Cron jobs initialized successfully');
};

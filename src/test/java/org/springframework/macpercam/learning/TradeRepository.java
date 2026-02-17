package org.springframework.macpercam.learning;

public interface TradeRepository {

	Price getPriceForTrade(Trade trade);

	Trade getTradeById(long anyLong);

	Long createTrade(Trade trade);

}

#!/usr/bin/env python3
"""
Agentic Search Module
Handles AWS Bedrock-based query decomposition and CSV data filtering
"""

import pandas as pd
import re
import os
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from query_converter import validate_user_answer
from config import config

@dataclass
class QueryDecomposition:
    """Represents a decomposed query with visual and data components"""
    visual_query: str
    data_criteria: List[Dict[str, Any]]
    reasoning: str

@dataclass
class SearchResult:
    """Represents a search result with metadata"""
    timestamp: float
    similarity: float
    data: Dict[str, Any]
    reasoning: str

class LLMAgenticSearch:
    """AWS Bedrock-based agentic search system that decomposes queries intelligently"""
    
    def __init__(self):
        self.csv_data = None
        
    def initialize(self, data_path: str):
        """Initialize the AWS Bedrock-based search system"""
        try:
            print("Initializing AWS Bedrock-based agentic search system...")
            
            # Load data
            if data_path and os.path.exists(data_path):
                self.csv_data = pd.read_csv(data_path)
                print(f"Data loaded: {len(self.csv_data)} records")
                print(f"Fields: {list(self.csv_data.columns)}")
            else:
                raise Exception(f"Data file not found: {data_path}")
            
            print("AWS Bedrock-based agentic search system ready")
            
        except Exception as e:
            print(f"Error initializing system: {e}")
            raise e
    
    def decompose_query(self, query: str) -> QueryDecomposition:
        """
        STEP 1: Decompose complex query into visual query + data criteria using AWS Bedrock
        Example: "manufacturing at 10 kmph with acceleration of more than 10 m/s^2"
        -> visual: "manufacturing"
        -> criteria: [{"field": "speed_kmh", "operator": "==", "value": 10}, 
                      {"field": "acceleration_x_ms2", "operator": ">=", "value": 10}]
        """
        print(f"\nDecomposing query: '{query}'")
        
        try:
            return self._decompose_with_bedrock(query)
        except Exception as e:
            print(f"Bedrock decomposition failed: {e}")
            # Fallback to pattern-based analysis
            return self._decompose_with_fallback(query)
    
    def _decompose_with_bedrock(self, query: str) -> QueryDecomposition:
        """Use AWS Bedrock to decompose the query"""
        try:
            # Get database schema from CSV columns
            headers = list(self.csv_data.columns) if self.csv_data is not None else []
            db_schema = {}
            for header in headers:
                # Determine data type
                if 'time' in header.lower() or 'timestamp' in header.lower():
                    db_schema[header] = "float"
                elif 'speed' in header.lower() or 'velocity' in header.lower():
                    db_schema[header] = "float"
                elif 'acceleration' in header.lower():
                    db_schema[header] = "float"
                else:
                    db_schema[header] = "float"
            
            # Use AWS Bedrock to convert query
            result = validate_user_answer(query, db_schema)
            
            if "error" in result:
                raise Exception(f"Bedrock error: {result['error']}")
            
            # Convert Bedrock result to our format
            visual_query = result.get("semantic_query", "")
            filters = result.get("filters", [])
            
            # Convert filters to our criteria format
            data_criteria = []
            for filter_item in filters:
                criteria = {
                    "field": filter_item["column"],
                    "operator": filter_item["operator"],
                    "value": filter_item["value"]
                }
                data_criteria.append(criteria)
            
            reasoning = f"Visual: {visual_query}. Data filters: {len(data_criteria)} criteria"
            
            print(f"Visual query: '{visual_query}'")
            print(f"Data criteria: {data_criteria}")
            print(f"Reasoning: {reasoning}")
            
            return QueryDecomposition(
                visual_query=visual_query,
                data_criteria=data_criteria,
                reasoning=reasoning
            )
            
        except Exception as e:
            print(f"Bedrock decomposition error: {e}")
            raise e
    
    def _decompose_with_fallback(self, query: str) -> QueryDecomposition:
        """Fallback query decomposition using pattern matching"""
        query_lower = query.lower()
        headers = list(self.csv_data.columns) if self.csv_data is not None else []

        # Extract visual query (nouns/objects) and data criteria
        visual_parts = []
        data_criteria = []

        # Use configuration for generic mappings
        unit_to_field = config.get_unit_mappings()
        data_keywords = config.get_data_keywords()
        visual_keywords = config.get_visual_keywords()

        # Split query by separators to find different components
        separators = r'\s+(?:with|and|,)\s+'
        parts = re.split(separators, query_lower)

        # Process each part
        for part in parts:
            part = part.strip()

            # Check if this part contains a number (likely data criterion)
            numbers = re.findall(r'\d+(?:\.\d+)?', part)

            if numbers:
                # This is a data criterion
                number = float(numbers[0])

                # Find the field by matching units or field names
                field = None
                
                # First try unit-based matching
                for unit, keyword in unit_to_field.items():
                    if unit in part:
                        # Find matching field in headers using semantic similarity
                        field = self._find_field_by_semantic_match(keyword, headers)
                        if field:
                            break
                
                # If no unit match, try direct field name matching
                if not field:
                    field = self._find_field_by_direct_match(part, headers)

                # Determine operator from context
                if any(word in part for word in ['faster', 'more than', 'over', 'above', 'higher', 'greater']):
                    operator = '>='
                elif any(word in part for word in ['slower', 'less than', 'under', 'below', 'lower']):
                    operator = '<='
                elif any(word in part for word in ['at', 'exactly', 'equals']):
                    if any(word in query_lower for word in ['or higher', 'or more', 'or greater']):
                        operator = '>='
                    elif any(word in query_lower for word in ['or lower', 'or less']):
                        operator = '<='
                    else:
                        operator = '=='
                else:
                    operator = '>='  # Default

                if field:
                    data_criteria.append({
                        'field': field,
                        'operator': operator,
                        'value': number
                    })
            else:
                # This part has no numbers - could be visual
                # Extract words, but filter out data-related terms
                words = part.split()
                for word in words:
                    # Skip stopwords and data keywords
                    if (len(word) > 2 and
                        word not in ['the', 'a', 'an', 'in', 'on', 'at', 'with', 'and', 'or', 'of', 'me', 'find'] and
                        word not in data_keywords):
                        visual_parts.append(word)

        # Prioritize visual keywords if present
        prioritized_visual = []
        for word in visual_parts:
            if word in visual_keywords:
                prioritized_visual.insert(0, word)  # Add to front
            else:
                prioritized_visual.append(word)

        # Build visual query - prefer visual keywords
        if prioritized_visual:
            # If we have recognized visual objects, use only those
            visual_objects = [w for w in prioritized_visual if w in visual_keywords]
            if visual_objects:
                visual_query = ' '.join(visual_objects[:2])  # Take up to 2 visual objects
            else:
                visual_query = ' '.join(prioritized_visual[:2])  # Take first 2 words
        else:
            # Fallback: try to find any visual noun in the original query
            all_words = query_lower.split()
            visual_candidates = [w for w in all_words if w in visual_keywords]
            if visual_candidates:
                visual_query = visual_candidates[0]
            else:
                # Last resort: use first non-data word
                visual_query = next((w for w in all_words if w not in data_keywords and len(w) > 3), all_words[0])

        reasoning = f"Visual: {visual_query}. Data filters: {len(data_criteria)} criteria"

        return QueryDecomposition(
            visual_query=visual_query,
            data_criteria=data_criteria,
            reasoning=reasoning
        )
    
    def _get_interpolated_data(self, timestamp: float) -> Dict[str, Any]:
        """
        Get interpolated CSV data for a given timestamp
        If exact match exists, return it. Otherwise, interpolate between nearest values.
        """
        time_col = self._find_time_column()
        if not time_col or self.csv_data is None:
            return {}
        
        # Try exact match first (within 0.001 seconds)
        exact_match = self.csv_data[abs(self.csv_data[time_col] - timestamp) < 0.001]
        if not exact_match.empty:
            return exact_match.iloc[0].to_dict()
        
        # Find closest timestamps (one below, one above)
        csv_times = self.csv_data[time_col].values
        
        # Find the closest timestamp below and above
        below_times = csv_times[csv_times <= timestamp]
        above_times = csv_times[csv_times > timestamp]
        
        if len(below_times) == 0 and len(above_times) == 0:
            return {}
        
        # If only one side exists, use nearest neighbor
        if len(below_times) == 0:
            nearest_time = above_times[0]
            return self.csv_data[self.csv_data[time_col] == nearest_time].iloc[0].to_dict()
        
        if len(above_times) == 0:
            nearest_time = below_times[-1]
            return self.csv_data[self.csv_data[time_col] == nearest_time].iloc[0].to_dict()
        
        # Get the timestamps just below and above
        time_below = below_times[-1]
        time_above = above_times[0]
        
        # Get the data rows
        row_below = self.csv_data[self.csv_data[time_col] == time_below].iloc[0]
        row_above = self.csv_data[self.csv_data[time_col] == time_above].iloc[0]
        
        # Calculate interpolation weight
        time_range = time_above - time_below
        if time_range == 0:
            return row_below.to_dict()
        
        weight_above = (timestamp - time_below) / time_range
        weight_below = 1.0 - weight_above
        
        # Interpolate numeric values, keep non-numeric from closest
        interpolated_data = {}
        for col in self.csv_data.columns:
            if col == time_col:
                interpolated_data[col] = timestamp
            elif pd.api.types.is_numeric_dtype(self.csv_data[col]):
                # Interpolate numeric values
                val_below = row_below[col]
                val_above = row_above[col]
                if pd.notna(val_below) and pd.notna(val_above):
                    interpolated_data[col] = weight_below * val_below + weight_above * val_above
                else:
                    # Use the non-null value or the closest one
                    interpolated_data[col] = val_below if pd.notna(val_below) else val_above
            else:
                # For non-numeric, use the closest value
                if abs(timestamp - time_below) < abs(timestamp - time_above):
                    interpolated_data[col] = row_below[col]
                else:
                    interpolated_data[col] = row_above[col]
        
        return interpolated_data
    
    def _check_criteria_match(self, data: Dict[str, Any], criteria: List[Dict[str, Any]]) -> bool:
        """Check if interpolated data matches all criteria"""
        for criterion in criteria:
            field = criterion['field']
            operator = criterion['operator']
            value = criterion['value']
            
            if field not in data:
                return False
            
            data_value = data[field]
            if not isinstance(data_value, (int, float)):
                return False
            
            # Check operator
            if operator == '>=':
                if not (data_value >= value):
                    return False
            elif operator == '<=':
                if not (data_value <= value):
                    return False
            elif operator == '>':
                if not (data_value > value):
                    return False
            elif operator == '<':
                if not (data_value < value):
                    return False
            elif operator == '==':
                if not (abs(data_value - value) < 0.01):  # Tolerance for equality
                    return False
        
        return True
    
    def search(self, query: str, video_results: List[Tuple[float, float]], top_k: int = 10) -> List[SearchResult]:
        """
        STEP 2: Apply data filters to video search results with interpolation
        """
        print(f"\nApplying data filters to {len(video_results)} video results...")
        
        # Decompose query to get criteria
        decomposition = self.decompose_query(query)
        
        search_results = []
        
        if not decomposition.data_criteria:
            # No data criteria, return all video results with interpolated data
            for timestamp, similarity in video_results[:top_k]:
                data = self._get_interpolated_data(timestamp)
                
                search_results.append(SearchResult(
                    timestamp=timestamp,
                    similarity=similarity,
                    data=data,
                    reasoning=decomposition.reasoning
                ))
            return search_results
        
        # With data criteria - check each video result
        print(f"Checking {len(video_results)} results against {len(decomposition.data_criteria)} criteria...")
        
        for timestamp, similarity in video_results:
            # Get interpolated data for this timestamp
            data = self._get_interpolated_data(timestamp)
            
            if not data:
                continue
            
            # Check if data matches all criteria
            if self._check_criteria_match(data, decomposition.data_criteria):
                search_results.append(SearchResult(
                    timestamp=timestamp,
                    similarity=similarity,
                    data=data,
                    reasoning=decomposition.reasoning
                ))
                
                if len(search_results) >= top_k:
                    break
        
        print(f"Found {len(search_results)} results matching criteria")
        return search_results
    
    def _find_time_column(self) -> str:
        """Find the time/timestamp column in the CSV"""
        time_columns = config.get_time_columns()
        for col in time_columns:
            if col in self.csv_data.columns:
                return col
        return self.csv_data.columns[0]  # Fallback to first column
    
    def _build_pandas_query(self, criteria: List[Dict[str, Any]]) -> str:
        """Build pandas query string from criteria"""
        query_parts = []
        
        for criterion in criteria:
            field = criterion['field']
            operator = criterion['operator']
            value = criterion['value']
            
            # Escape field name with backticks
            field_escaped = f"`{field}`"
            
            # Handle different operators
            if operator == '>=':
                query_parts.append(f"{field_escaped} >= {value}")
            elif operator == '<=':
                query_parts.append(f"{field_escaped} <= {value}")
            elif operator == '>':
                query_parts.append(f"{field_escaped} > {value}")
            elif operator == '<':
                query_parts.append(f"{field_escaped} < {value}")
            elif operator == '==':
                query_parts.append(f"{field_escaped} == {value}")
            else:
                query_parts.append(f"{field_escaped} >= {value}")  # Default
        
        return " and ".join(query_parts)
    
    def _find_field_by_semantic_match(self, keyword: str, headers: List[str]) -> str:
        """Find field by semantic similarity to keyword"""
        best_field = None
        best_score = 0
        
        for header in headers:
            header_lower = header.lower()
            score = 0
            
            # Direct keyword match
            if keyword in header_lower:
                score += 10
            
            # Partial word match
            header_words = header_lower.replace('_', ' ').split()
            for word in header_words:
                if len(word) > 3 and keyword in word:
                    score += 5
                elif len(word) > 3 and word in keyword:
                    score += 3
            
            # Synonym matching (basic)
            synonyms = self._get_synonyms(keyword)
            for synonym in synonyms:
                if synonym in header_lower:
                    score += 2
            
            if score > best_score:
                best_score = score
                best_field = header
        
        return best_field if best_score > 0 else None
    
    def _find_field_by_direct_match(self, part: str, headers: List[str]) -> str:
        """Find field by direct word matching"""
        best_field = None
        best_score = 0
        
        part_words = part.split()
        
        for header in headers:
            header_lower = header.lower()
            header_words = header_lower.replace('_', ' ').split()
            score = 0
            
            # Check for word matches
            for part_word in part_words:
                if len(part_word) > 3:  # Only consider meaningful words
                    for header_word in header_words:
                        if len(header_word) > 3:
                            if part_word == header_word:
                                score += 10
                            elif part_word in header_word or header_word in part_word:
                                score += 5
            
            if score > best_score:
                best_score = score
                best_field = header
        
        return best_field if best_score > 0 else None
    
    def _get_synonyms(self, keyword: str) -> List[str]:
        """Get synonyms for common measurement keywords"""
        return config.get_synonyms().get(keyword, [])

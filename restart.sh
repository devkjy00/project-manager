#!/bin/bash

# Project Manager - 재시작 스크립트
echo "========================================"
echo "  Project Manager - 전체 시스템 재시작"
echo "========================================"
echo ""

# 중지
./stop.sh

# 잠시 대기
sleep 2

echo ""
echo "========================================"
echo ""

# 시작
./start.sh
